-- =============================================================================
-- Catálogo de modelos pré-fixados (Marca + Modelo + faixa de anos) — pedido
-- do usuário: "deixe alguns carros pré fixadas como: Marca, modelo, ano, para
-- que quando for identificado aquele mesmo marca, modelo e ano, o cliente
-- seja notificado".
--
-- O cliente escolhe um item do catálogo ao registrar a preferência
-- (decisão do usuário: "Catálogo + opção 'outro' livre"). A tabela
-- preferencias_veiculo ganha `catalogo_modelo_id` opcional: quando
-- preenchido, marca/modelo/ano da preferência espelham o catálogo; quando
-- nulo, valem os campos livres já existentes.
--
-- Casamento por faixa de anos (decisão do usuário: "Modelo com faixa de
-- anos") — o item do catálogo tem ano_min/ano_max e casa qualquer veículo
-- cujo ano_modelo caia na faixa.
-- =============================================================================

create table public.catalogo_modelos (
  id            uuid primary key default gen_random_uuid(),
  marca         text not null,
  modelo        text not null,
  ano_min       smallint,
  ano_max       smallint,
  observacoes   text,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint catalogo_modelos_anos_coerentes check (
    ano_min is null or ano_max is null or ano_min <= ano_max
  ),
  constraint catalogo_modelos_anos_plausiveis check (
    (ano_min is null or (ano_min >= 1950 and ano_min <= 2100))
    and (ano_max is null or (ano_max >= 1950 and ano_max <= 2100))
  )
);

comment on table public.catalogo_modelos is
  'Modelos pré-fixados (marca/modelo + faixa de anos) que o cliente pode escolher como preferência. Gerenciado no /admin.';

-- Não repetir a mesma marca+modelo+faixa no catálogo ativo.
create unique index catalogo_modelos_sem_duplicata on public.catalogo_modelos
  (lower(marca), lower(modelo), coalesce(ano_min, 0), coalesce(ano_max, 0))
  where ativo;

create index catalogo_modelos_marca_modelo_idx on public.catalogo_modelos
  (lower(marca), lower(modelo)) where ativo;

create trigger catalogo_modelos_atualiza_timestamp
  before update on public.catalogo_modelos
  for each row
  execute function moddatetime(atualizado_em);


-- -----------------------------------------------------------------------------
-- preferencias_veiculo.catalogo_modelo_id — liga a preferência a um item do
-- catálogo (opcional). ON DELETE SET NULL: remover do catálogo não apaga a
-- preferência do cliente, ela vira "livre" com os valores que já tinha.
-- -----------------------------------------------------------------------------
alter table public.preferencias_veiculo
  add column catalogo_modelo_id uuid references public.catalogo_modelos (id) on delete set null;

comment on column public.preferencias_veiculo.catalogo_modelo_id is
  'Item do catálogo escolhido pelo cliente. Nulo = preferência de texto livre.';


-- -----------------------------------------------------------------------------
-- RLS: staff/vendedor com estoque.editar gerencia; qualquer autenticado LÊ o
-- catálogo ativo (o cliente precisa listar para escolher).
-- -----------------------------------------------------------------------------
alter table public.catalogo_modelos enable row level security;
alter table public.catalogo_modelos force row level security;

create policy catalogo_modelos_staff_tudo on public.catalogo_modelos
  for all to authenticated
  using (public.tem_permissao('estoque.editar'))
  with check (public.tem_permissao('estoque.editar'));

create policy catalogo_modelos_todos_leem_ativos on public.catalogo_modelos
  for select to authenticated
  using (ativo);


-- -----------------------------------------------------------------------------
-- RPC definir_preferencia_veiculo — nova versão que aceita catalogo_modelo_id.
-- Quando informado, marca/modelo/anos vêm do catálogo (ignora os campos
-- livres de marca/modelo). Mantém a assinatura antiga funcionando: os
-- parâmetros novos têm default.
-- -----------------------------------------------------------------------------
create or replace function public.definir_preferencia_veiculo(
  p_marca text default null,
  p_modelo text default null,
  p_ano_min smallint default null,
  p_ano_max smallint default null,
  p_valor_meta_centavos bigint default null,
  p_observacoes text default null,
  p_catalogo_modelo_id uuid default null
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
  v_marca text;
  v_modelo text;
  v_ano_min smallint;
  v_ano_max smallint;
  v_catalogo public.catalogo_modelos%rowtype;
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

  if p_catalogo_modelo_id is not null then
    select * into v_catalogo
    from public.catalogo_modelos
    where id = p_catalogo_modelo_id and ativo;

    if not found then
      raise exception 'Modelo do catálogo não encontrado' using errcode = 'P0021';
    end if;

    v_marca := v_catalogo.marca;
    v_modelo := v_catalogo.modelo;
    v_ano_min := v_catalogo.ano_min;
    v_ano_max := v_catalogo.ano_max;
  else
    if trim(coalesce(p_marca, '')) = '' or trim(coalesce(p_modelo, '')) = '' then
      raise exception 'Marca e modelo são obrigatórios' using errcode = 'P0020';
    end if;
    v_marca := trim(p_marca);
    v_modelo := trim(p_modelo);
    v_ano_min := p_ano_min;
    v_ano_max := p_ano_max;
  end if;

  insert into public.preferencias_veiculo (
    plano_id, marca, modelo, ano_min, ano_max, valor_meta_centavos,
    observacoes, catalogo_modelo_id
  )
  values (
    v_plano_id, v_marca, v_modelo, v_ano_min, v_ano_max,
    p_valor_meta_centavos, p_observacoes, p_catalogo_modelo_id
  )
  on conflict (plano_id, lower(marca), lower(modelo)) where ativa
  do update set
    ano_min = excluded.ano_min,
    ano_max = excluded.ano_max,
    valor_meta_centavos = excluded.valor_meta_centavos,
    observacoes = excluded.observacoes,
    catalogo_modelo_id = excluded.catalogo_modelo_id,
    atualizado_em = now()
  returning * into v_pref;

  return v_pref;
end;
$$;

comment on function public.definir_preferencia_veiculo(text, text, smallint, smallint, bigint, text, uuid) is
  'Cliente cria/atualiza sua preferência de veículo. Se p_catalogo_modelo_id vier, marca/modelo/anos vêm do catálogo; senão, dos campos livres.';

revoke all on function public.definir_preferencia_veiculo(text, text, smallint, smallint, bigint, text, uuid) from public;
grant execute on function public.definir_preferencia_veiculo(text, text, smallint, smallint, bigint, text, uuid) to authenticated;

-- A versão de 7 args acima é um overload novo (assinatura diferente da de 6).
-- Removemos a antiga para não deixar duas funções de mesmo nome — o PostgREST
-- não saberia qual chamar e a resolução de overload ficaria ambígua.
drop function if exists public.definir_preferencia_veiculo(text, text, smallint, smallint, bigint, text);


-- -----------------------------------------------------------------------------
-- Casamento por preferência — nova versão: quando a preferência está ligada
-- ao catálogo (catalogo_modelo_id não nulo), a faixa de anos vem do catálogo
-- AO VIVO (o admin pode ter ajustado depois). Marca/modelo continuam da linha
-- de preferência (o RPC os copia do catálogo na criação e eles não mudam de
-- significado). Preferência livre usa os próprios ano_min/ano_max.
-- -----------------------------------------------------------------------------
create or replace function public.enfileirar_notificacoes_preferencia(
  p_veiculo_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qtd integer := 0;
  v_veiculo public.veiculos%rowtype;
begin
  select * into v_veiculo from public.veiculos where id = p_veiculo_id;
  if not found or v_veiculo.status <> 'disponivel' then
    return 0;
  end if;

  with casamentos as (
    select distinct
      pl.cliente_id,
      pv.id as preferencia_id
    from public.preferencias_veiculo pv
    join public.planos pl on pl.id = pv.plano_id and pl.status = 'ativo'
    left join public.catalogo_modelos cm on cm.id = pv.catalogo_modelo_id
    where pv.ativa
      and lower(pv.marca) = lower(v_veiculo.marca)
      and lower(pv.modelo) = lower(v_veiculo.modelo)
      and (coalesce(cm.ano_min, pv.ano_min) is null
           or v_veiculo.ano_modelo >= coalesce(cm.ano_min, pv.ano_min))
      and (coalesce(cm.ano_max, pv.ano_max) is null
           or v_veiculo.ano_modelo <= coalesce(cm.ano_max, pv.ano_max))
      -- não duplica aviso se o cliente já é elegível (já recebeu/vai
      -- receber 'novo_elegivel' pelo enfileirar_notificacoes_veiculo).
      and not exists (
        select 1
        from public.vw_saldo_cliente s
        where s.plano_id = pl.id
          and s.saldo_confirmado_centavos >= public.meta_centavos(v_veiculo.preco_venda_centavos, pl.percentual_minimo)
      )
  ),
  inseridos as (
    insert into public.notificacoes (cliente_id, veiculo_id, tipo, canal, template, payload, status)
    select
      c.cliente_id,
      p_veiculo_id,
      'preferencia_disponivel',
      'whatsapp',
      'veiculo_da_preferencia_chegou',
      jsonb_build_object(
        'marca', v_veiculo.marca,
        'modelo', v_veiculo.modelo,
        'preco_venda_centavos', v_veiculo.preco_venda_centavos,
        'preferencia_id', c.preferencia_id
      ),
      'fila'
    from casamentos c
    on conflict (cliente_id, veiculo_id, tipo) do nothing
    returning 1
  )
  select count(*) into v_qtd from inseridos;

  return v_qtd;
end;
$$;
