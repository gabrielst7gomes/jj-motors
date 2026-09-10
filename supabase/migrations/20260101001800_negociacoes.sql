-- =============================================================================
-- Negociações — substitui a "reserva" exclusiva por um sinal de interesse.
--
-- Pedido do usuário: "ao inves de aparecer para reservar, coloque 'abrir
-- negociação', sendo assim vários clientes podem marcar, e o vendedor
-- vinculado àquele cliente poderá consultar as negociações e atender
-- diretamente pelo WhatsApp".
--
-- Diferenças para `reservas` (que fica no banco, mas o app deixa de usar):
--   - NÃO trava o veículo (ele continua 'disponivel'); vários clientes podem
--     abrir negociação do mesmo carro.
--   - NÃO exige elegibilidade dos 50% (decisão do usuário: "qualquer cliente
--     com plano ativo") — o vendedor negocia entrada antecipada / prazo.
--   - Carrega o vendedor vinculado ao plano (planos.vendedor_id), copiado no
--     insert, para a tela do vendedor filtrar "as minhas".
--
-- A venda ainda é marcada pelo admin/vendedor com permissão, agora a partir
-- de uma negociação (converter_negociacao_em_venda) — é ela que liga a venda
-- ao plano e, por tabela, ao vendedor da comissão.
-- =============================================================================

create type public.status_negociacao as enum (
  'nova',          -- cliente abriu, vendedor ainda não pegou
  'em_andamento',  -- vendedor está atendendo
  'fechada',       -- virou venda (ver converter_negociacao_em_venda)
  'perdida'        -- cliente desistiu / comprou outro
);

create table public.negociacoes (
  id            uuid primary key default gen_random_uuid(),
  veiculo_id    uuid not null references public.veiculos (id) on delete cascade,
  plano_id      uuid not null references public.planos (id) on delete cascade,
  cliente_id    uuid not null references public.profiles (id) on delete cascade,
  vendedor_id   uuid references public.profiles (id) on delete set null,
  status        public.status_negociacao not null default 'nova',
  mensagem      text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.negociacoes is
  'Sinal de interesse de um cliente num veículo. Não trava o veículo; vários clientes por veículo. O vendedor vinculado ao plano atende pelo WhatsApp.';
comment on column public.negociacoes.vendedor_id is
  'Vendedor do plano no momento da abertura (copiado de planos.vendedor_id). Null se o plano não tinha vendedor.';

create index negociacoes_veiculo_idx on public.negociacoes (veiculo_id);
create index negociacoes_vendedor_idx on public.negociacoes (vendedor_id, status, criado_em desc);
create index negociacoes_cliente_idx on public.negociacoes (cliente_id, criado_em desc);

-- Uma negociação "viva" por (cliente, veículo). Reabrir depois de perdida/
-- fechada é permitido (novo registro), mas não duas abertas ao mesmo tempo.
create unique index negociacoes_uma_viva_por_cliente_veiculo
  on public.negociacoes (cliente_id, veiculo_id)
  where status in ('nova', 'em_andamento');

create trigger negociacoes_atualiza_timestamp
  before update on public.negociacoes
  for each row
  execute function moddatetime(atualizado_em);


-- -----------------------------------------------------------------------------
-- RLS
--   cliente  -> vê as suas (via plano)
--   vendedor -> vê as dos clientes vinculados a ele (vendedor_id = auth.uid())
--   staff    -> tudo (tem_permissao('reservas.gerenciar'))
-- -----------------------------------------------------------------------------
alter table public.negociacoes enable row level security;
alter table public.negociacoes force row level security;

create policy negociacoes_staff_tudo on public.negociacoes
  for all to authenticated
  using (public.tem_permissao('reservas.gerenciar'))
  with check (public.tem_permissao('reservas.gerenciar'));

create policy negociacoes_vendedor_le on public.negociacoes
  for select to authenticated
  using (vendedor_id = auth.uid());

create policy negociacoes_cliente_le on public.negociacoes
  for select to authenticated
  using (public.plano_e_meu(plano_id));


-- -----------------------------------------------------------------------------
-- RPC: cliente abre negociação. SECURITY DEFINER (mesmo padrão de
-- criar_reserva) — resolve plano ativo + vendedor, sem checar elegibilidade.
-- -----------------------------------------------------------------------------
create or replace function public.abrir_negociacao(
  p_veiculo_id uuid,
  p_mensagem text default null
)
returns public.negociacoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_plano    public.planos%rowtype;
  v_veiculo  public.veiculos%rowtype;
  v_negoc    public.negociacoes%rowtype;
begin
  if v_uid is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  select * into v_plano
  from public.planos
  where cliente_id = v_uid and status = 'ativo'
  order by data_adesao
  limit 1;

  if not found then
    raise exception 'Cliente sem plano ativo' using errcode = 'P0001';
  end if;

  select * into v_veiculo from public.veiculos where id = p_veiculo_id;
  if not found then
    raise exception 'Veículo não encontrado' using errcode = 'P0002';
  end if;
  if v_veiculo.status = 'vendido' then
    raise exception 'Este veículo já foi vendido' using errcode = 'P0003';
  end if;

  -- Já existe uma negociação viva deste cliente para este veículo? Devolve ela.
  select * into v_negoc
  from public.negociacoes
  where cliente_id = v_uid and veiculo_id = p_veiculo_id
    and status in ('nova', 'em_andamento')
  limit 1;

  if found then
    return v_negoc;
  end if;

  insert into public.negociacoes (veiculo_id, plano_id, cliente_id, vendedor_id, mensagem)
  values (p_veiculo_id, v_plano.id, v_uid, v_plano.vendedor_id, nullif(trim(p_mensagem), ''))
  returning * into v_negoc;

  insert into public.audit_log (usuario_id, acao, entidade, entidade_id, dados_depois)
  values (v_uid, 'abrir_negociacao', 'negociacoes', v_negoc.id, to_jsonb(v_negoc));

  return v_negoc;
end;
$$;

comment on function public.abrir_negociacao(uuid, text) is
  'Cliente abre negociação de um veículo (sem trava, sem exigir 50%). Idempotente: devolve a negociação viva se já existir.';

revoke all on function public.abrir_negociacao(uuid, text) from public;
grant execute on function public.abrir_negociacao(uuid, text) to authenticated;


-- -----------------------------------------------------------------------------
-- RPC: vendedor dono / staff muda o status de uma negociação.
-- -----------------------------------------------------------------------------
create or replace function public.atualizar_status_negociacao(
  p_negociacao_id uuid,
  p_status public.status_negociacao
)
returns public.negociacoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_negoc public.negociacoes%rowtype;
begin
  select * into v_negoc from public.negociacoes where id = p_negociacao_id;
  if not found then
    raise exception 'Negociação não encontrada' using errcode = 'P0010';
  end if;

  if not (public.tem_permissao('reservas.gerenciar') or v_negoc.vendedor_id = v_uid) then
    raise exception 'Sem permissão para esta negociação' using errcode = '42501';
  end if;

  if p_status = 'fechada' then
    raise exception 'Use converter_negociacao_em_venda para fechar (gera a comissão)'
      using errcode = 'P0011';
  end if;

  update public.negociacoes
    set status = p_status, atualizado_em = now()
    where id = p_negociacao_id
    returning * into v_negoc;

  return v_negoc;
end;
$$;

revoke all on function public.atualizar_status_negociacao(uuid, public.status_negociacao) from public;
grant execute on function public.atualizar_status_negociacao(uuid, public.status_negociacao) to authenticated;


-- -----------------------------------------------------------------------------
-- RPC: converte negociação em venda. Mesma lógica de
-- converter_reserva_em_venda: veículo -> vendido, gera comissão pendente se o
-- plano tiver vendedor. Marca ESTA negociação 'fechada' e as OUTRAS do mesmo
-- veículo 'perdida' (o carro saiu).
-- -----------------------------------------------------------------------------
create or replace function public.converter_negociacao_em_venda(p_negociacao_id uuid)
returns public.comissoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_negoc      public.negociacoes%rowtype;
  v_veiculo    public.veiculos%rowtype;
  v_plano      public.planos%rowtype;
  v_percentual numeric;
  v_valor      bigint;
  v_comissao   public.comissoes%rowtype;
  v_uid        uuid := auth.uid();
begin
  if not public.tem_permissao('reservas.gerenciar') then
    raise exception 'Sem permissão para gerenciar negociações' using errcode = '42501';
  end if;

  select * into v_negoc from public.negociacoes where id = p_negociacao_id for update;
  if not found then
    raise exception 'Negociação não encontrada' using errcode = 'P0010';
  end if;
  if v_negoc.status = 'fechada' then
    raise exception 'Negociação já foi fechada' using errcode = 'P0011';
  end if;

  select * into v_veiculo from public.veiculos where id = v_negoc.veiculo_id for update;
  if not found then
    raise exception 'Veículo não encontrado' using errcode = 'P0012';
  end if;
  if v_veiculo.status = 'vendido' then
    raise exception 'Veículo já vendido' using errcode = 'P0013';
  end if;

  select * into v_plano from public.planos where id = v_negoc.plano_id;

  update public.veiculos set status = 'vendido' where id = v_negoc.veiculo_id;
  update public.negociacoes set status = 'fechada', atualizado_em = now()
    where id = p_negociacao_id;
  -- As outras negociações vivas do mesmo veículo perderam.
  update public.negociacoes set status = 'perdida', atualizado_em = now()
    where veiculo_id = v_negoc.veiculo_id
      and id <> p_negociacao_id
      and status in ('nova', 'em_andamento');

  insert into public.audit_log (usuario_id, acao, entidade, entidade_id, dados_depois)
  values (
    v_uid, 'converter_negociacao_em_venda', 'negociacoes', p_negociacao_id,
    jsonb_build_object('status', 'fechada', 'veiculo_id', v_negoc.veiculo_id)
  );

  if v_plano.vendedor_id is not null then
    select coalesce(c.percentual_comissao, 0) into v_percentual
    from public.profiles p
    left join public.cargos c on c.id = p.cargo_id
    where p.id = v_plano.vendedor_id;

    v_percentual := coalesce(v_percentual, 0);
    v_valor := round(v_veiculo.preco_venda_centavos * v_percentual);

    insert into public.comissoes (
      vendedor_id, plano_id, veiculo_id, reserva_id,
      percentual, preco_venda_centavos, valor_centavos, status
    )
    values (
      v_plano.vendedor_id, v_plano.id, v_veiculo.id, null,
      v_percentual, v_veiculo.preco_venda_centavos, v_valor, 'pendente'
    )
    on conflict (veiculo_id, plano_id) do nothing
    returning * into v_comissao;

    insert into public.audit_log (usuario_id, acao, entidade, entidade_id, dados_depois)
    values (
      v_uid, 'gerar_comissao', 'comissoes', v_comissao.id,
      jsonb_build_object('vendedor_id', v_plano.vendedor_id, 'percentual', v_percentual, 'valor_centavos', v_valor)
    );
  end if;

  return v_comissao;
end;
$$;

comment on function public.converter_negociacao_em_venda(uuid) is
  'Fecha a negociação como venda: veículo->vendido, outras negociações do veículo->perdida, gera comissão pendente se o plano tiver vendedor. Requer reservas.gerenciar.';

revoke all on function public.converter_negociacao_em_venda(uuid) from public;
grant execute on function public.converter_negociacao_em_venda(uuid) to authenticated;


-- Relabel da permissão (a chave continua 'reservas.gerenciar' para não
-- quebrar policies/migrations antigas, mas agora cobre negociações).
update public.permissoes
  set descricao = 'Gerenciar negociações: atender, mudar status e marcar como vendido.'
  where chave = 'reservas.gerenciar';
