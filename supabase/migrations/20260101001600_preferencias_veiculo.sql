-- =============================================================================
-- Preferência de veículo do cliente (CRM) — pedido do usuário:
--
-- "pergunte a ele qual valor da meta dele, pergunte Marca/Modelo/Ano do carro
-- que ele deseja, e deixe isso gravado como CRM, para que quando for
-- adicionado um carro como esse no estoque, aparecer para ele, mesmo que ele
-- não tenha os 50% do valor do carro, às vezes ele pode antecipar."
--
-- Diferença para o campo já existente `planos.veiculo_alvo_id`: aquele só
-- aponta para um veículo que JÁ existe no estoque. Esta tabela captura o
-- desejo do cliente em texto livre (marca/modelo/ano), que pode não
-- corresponder a nada no estoque ainda — e faz o casamento quando um veículo
-- compatível é cadastrado, indo além do critério de elegibilidade por saldo
-- (o cliente pode querer ver o carro mesmo sem os 50%, para se planejar ou
-- negociar entrada antecipada).
-- =============================================================================

create table public.preferencias_veiculo (
  id              uuid primary key default gen_random_uuid(),
  plano_id        uuid not null references public.planos (id) on delete cascade,
  marca           text not null,
  modelo          text not null,
  ano_min         smallint,
  ano_max         smallint,
  valor_meta_centavos bigint,
  observacoes     text,
  ativa           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),

  constraint preferencias_veiculo_anos_coerentes check (
    ano_min is null or ano_max is null or ano_min <= ano_max
  ),
  constraint preferencias_veiculo_valor_positivo check (
    valor_meta_centavos is null or valor_meta_centavos > 0
  )
);

comment on table public.preferencias_veiculo is
  'CRM de desejo do cliente: marca/modelo/ano livre + valor-meta, independente do estoque atual. Casamento contra veículos novos feito por marca+modelo (ilike), sem exigir elegibilidade de saldo.';

create index preferencias_veiculo_plano_idx on public.preferencias_veiculo (plano_id) where ativa;
create index preferencias_veiculo_marca_modelo_idx on public.preferencias_veiculo (lower(marca), lower(modelo)) where ativa;

-- Um cliente pode ter várias preferências ativas (ex.: aceita mais de um
-- modelo), mas não duplicar exatamente a mesma marca+modelo.
create unique index preferencias_veiculo_sem_duplicata on public.preferencias_veiculo
  (plano_id, lower(marca), lower(modelo)) where ativa;

create trigger preferencias_veiculo_atualiza_timestamp
  before update on public.preferencias_veiculo
  for each row
  execute function moddatetime(atualizado_em);


-- -----------------------------------------------------------------------------
-- RLS: cliente gerencia as próprias preferências (via RPC, mesma lógica de
-- criar_reserva — nunca escrita direta na tabela); staff/vendedor com
-- permissão de clientes vê tudo.
-- -----------------------------------------------------------------------------
alter table public.preferencias_veiculo enable row level security;
alter table public.preferencias_veiculo force row level security;

create policy preferencias_veiculo_staff_tudo on public.preferencias_veiculo
  for all to authenticated
  using (public.tem_permissao('clientes.criar'))
  with check (public.tem_permissao('clientes.criar'));

create policy preferencias_veiculo_cliente_le on public.preferencias_veiculo
  for select to authenticated
  using (public.plano_e_meu(plano_id));


-- -----------------------------------------------------------------------------
-- RPC: cliente cria/atualiza a própria preferência. SECURITY DEFINER para
-- poder escrever mesmo sem policy de INSERT/UPDATE direta para cliente
-- (mesmo padrão de criar_reserva — validação sempre no servidor).
-- -----------------------------------------------------------------------------
create or replace function public.definir_preferencia_veiculo(
  p_marca text,
  p_modelo text,
  p_ano_min smallint default null,
  p_ano_max smallint default null,
  p_valor_meta_centavos bigint default null,
  p_observacoes text default null
)
returns public.preferencias_veiculo
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_plano_id uuid;
  v_pref public.preferencias_veiculo%rowtype;
begin
  if v_uid is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  select id into v_plano_id
  from public.planos
  where cliente_id = v_uid and status = 'ativo'
  order by data_adesao
  limit 1;

  if v_plano_id is null then
    raise exception 'Cliente sem plano ativo' using errcode = 'P0001';
  end if;

  if trim(coalesce(p_marca, '')) = '' or trim(coalesce(p_modelo, '')) = '' then
    raise exception 'Marca e modelo são obrigatórios' using errcode = 'P0020';
  end if;

  insert into public.preferencias_veiculo (
    plano_id, marca, modelo, ano_min, ano_max, valor_meta_centavos, observacoes
  )
  values (
    v_plano_id, trim(p_marca), trim(p_modelo), p_ano_min, p_ano_max,
    p_valor_meta_centavos, p_observacoes
  )
  on conflict (plano_id, lower(marca), lower(modelo)) where ativa
  do update set
    ano_min = excluded.ano_min,
    ano_max = excluded.ano_max,
    valor_meta_centavos = excluded.valor_meta_centavos,
    observacoes = excluded.observacoes,
    atualizado_em = now()
  returning * into v_pref;

  return v_pref;
end;
$$;

comment on function public.definir_preferencia_veiculo(text, text, smallint, smallint, bigint, text) is
  'Cliente cria/atualiza sua preferência de veículo (marca/modelo/ano/valor-meta). Upsert por marca+modelo.';

revoke all on function public.definir_preferencia_veiculo(text, text, smallint, smallint, bigint, text) from public;
grant execute on function public.definir_preferencia_veiculo(text, text, smallint, smallint, bigint, text) to authenticated;


create or replace function public.remover_preferencia_veiculo(p_preferencia_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  update public.preferencias_veiculo
    set ativa = false, atualizado_em = now()
    where id = p_preferencia_id
      and plano_id in (select id from public.planos where cliente_id = v_uid);
end;
$$;

revoke all on function public.remover_preferencia_veiculo(uuid) from public;
grant execute on function public.remover_preferencia_veiculo(uuid) to authenticated;


-- Novo tipo de notificação para casamento por preferência (sem exigir
-- elegibilidade de saldo) segue em migration própria — ver
-- 20260101001601_enum_preferencia_notificacao.sql — porque ALTER TYPE ... ADD
-- VALUE precisa estar em transação isolada de qualquer uso do novo valor
-- (mesmo motivo documentado em 20260101001300_enum_papel_vendedor.sql).
