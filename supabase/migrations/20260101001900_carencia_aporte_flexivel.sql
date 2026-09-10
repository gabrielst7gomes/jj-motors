-- =============================================================================
-- Carência de 3 meses + aporte flexível.
--
-- Pedido do usuário: "Os aportes dos clientes podem ser feitos em qualquer
-- dia, com qualquer valor, não é nada fixo! Porém, eles só conseguem se
-- eleger para comprar o veículo após 3 meses de ativação da CP."
--
-- Duas mudanças:
--
-- 1. CARÊNCIA. A elegibilidade real passa a exigir DUAS condições:
--      - saldo_confirmado >= meta (50% do preço)         [já existia]
--      - data_adesao + 3 meses de calendário <= hoje     [novo]
--    Decisão do usuário: 3 meses corridos a partir de planos.data_adesao,
--    não "aporte em 3 meses distintos".
--    A view expõe `saldo_ok` e `carencia_ok` separados para a UI poder
--    mostrar "pronto, disponível a partir de DD/MM" a quem já tem saldo mas
--    ainda está na carência.
--
-- 2. APORTE FLEXÍVEL. Removidas as colunas planos.dia_vencimento e
--    planos.aporte_mensal_previsto_centavos — não existe mais "dia de
--    vencimento" nem "valor mensal previsto". O aporte é livre em data e
--    valor. A estimativa de "~N meses para os 50%" passa a ser calculada no
--    app pela média dos aportes já confirmados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Meses de carência: configurável, default 3.
-- -----------------------------------------------------------------------------
insert into public.configuracoes (chave, valor, descricao) values
  ('carencia_meses', '3', 'Meses de calendário desde a adesão do plano antes do cliente poder se tornar elegível, mesmo com saldo suficiente.')
on conflict (chave) do nothing;

create or replace function public.meses_carencia()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select valor::integer from public.configuracoes where chave = 'carencia_meses'),
    3
  )
$$;

comment on function public.meses_carencia() is
  'Meses de carência desde a adesão (configuracoes.carencia_meses, default 3).';


-- -----------------------------------------------------------------------------
-- Remove as colunas de aporte fixo. Nada em RPC as referencia; o app é
-- atualizado na mesma leva.
-- -----------------------------------------------------------------------------
alter table public.planos
  drop column if exists dia_vencimento,
  drop column if exists aporte_mensal_previsto_centavos;


-- -----------------------------------------------------------------------------
-- vw_elegibilidade recriada: elegivel = saldo_ok AND carencia_ok.
-- Novas colunas: saldo_ok, carencia_ok, carencia_ate.
-- Mantém SEM security_invoker + filtro cliente_id embutido (ver migration
-- 20260101001100 para o porquê).
-- -----------------------------------------------------------------------------
drop view if exists public.vw_elegibilidade;

create view public.vw_elegibilidade
with (security_invoker = false) as
select
  s.plano_id,
  s.cliente_id,
  s.plano_codigo,
  v.id                                             as veiculo_id,
  v.marca,
  v.modelo,
  v.versao,
  v.preco_venda_centavos,
  s.percentual_minimo,
  s.saldo_confirmado_centavos,
  public.meta_centavos(v.preco_venda_centavos, s.percentual_minimo)
                                                   as meta_centavos,
  -- Condição 1: saldo cobre a meta.
  (s.saldo_confirmado_centavos
     >= public.meta_centavos(v.preco_venda_centavos, s.percentual_minimo))
                                                   as saldo_ok,
  -- Condição 2: passou a carência.
  (pl.data_adesao + make_interval(months => public.meses_carencia()) <= current_date)
                                                   as carencia_ok,
  (pl.data_adesao + make_interval(months => public.meses_carencia()))::date
                                                   as carencia_ate,
  -- Elegível = as duas condições.
  (s.saldo_confirmado_centavos
     >= public.meta_centavos(v.preco_venda_centavos, s.percentual_minimo)
   and pl.data_adesao + make_interval(months => public.meses_carencia()) <= current_date)
                                                   as elegivel,
  greatest(
    public.meta_centavos(v.preco_venda_centavos, s.percentual_minimo)
      - s.saldo_confirmado_centavos,
    0
  )::bigint                                        as valor_faltante_centavos
from public.vw_saldo_cliente s
join public.planos pl on pl.id = s.plano_id and pl.status = 'ativo'
cross join public.veiculos v
where v.status = 'disponivel'
  and (s.cliente_id = auth.uid() or public.is_staff());

comment on view public.vw_elegibilidade is
  'Cruzamento plano ativo × veículo disponível. elegivel = saldo_ok AND carencia_ok. '
  'saldo_ok/carencia_ok/carencia_ate expostos separados para a UI. '
  'SEM security_invoker + filtro cliente_id embutido — ver migration 20260101001100.';

grant select on public.vw_elegibilidade to authenticated;


-- -----------------------------------------------------------------------------
-- Notificação "novo_elegivel" / "reaberto" agora também respeita a carência:
-- só avisamos "você já pode comprar" quem cumpriu os 3 meses. Quem tem saldo
-- mas está na carência é coberto pela notificação de preferência
-- (preferencia_disponivel), que não exige elegibilidade.
-- -----------------------------------------------------------------------------
create or replace function public.enfileirar_notificacoes_veiculo(
  p_veiculo_id uuid,
  p_tipo public.tipo_notificacao,
  p_template text
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

  with elegiveis as (
    select
      pl.cliente_id, pl.id as plano_id,
      public.meta_centavos(v_veiculo.preco_venda_centavos, pl.percentual_minimo) as meta,
      coalesce(s.saldo_confirmado_centavos, 0) as saldo,
      (pl.data_adesao + make_interval(months => public.meses_carencia()) <= current_date) as carencia_ok
    from public.planos pl
    left join public.vw_saldo_cliente s on s.plano_id = pl.id
    where pl.status = 'ativo'
  ),
  inseridos as (
    insert into public.notificacoes (cliente_id, veiculo_id, tipo, canal, template, payload, status)
    select
      e.cliente_id, p_veiculo_id, p_tipo, 'whatsapp', p_template,
      jsonb_build_object(
        'marca', v_veiculo.marca, 'modelo', v_veiculo.modelo,
        'preco_venda_centavos', v_veiculo.preco_venda_centavos,
        'meta_centavos', e.meta, 'saldo_centavos', e.saldo
      ),
      'fila'
    from elegiveis e
    where e.saldo >= e.meta and e.carencia_ok
    on conflict (cliente_id, veiculo_id, tipo) do nothing
    returning 1
  )
  select count(*) into v_qtd from inseridos;

  return v_qtd;
end;
$$;

comment on function public.enfileirar_notificacoes_veiculo(uuid, public.tipo_notificacao, text) is
  'Enfileira notificações para clientes ELEGÍVEIS a um veículo (saldo >= meta E carência cumprida). Dedupe via ON CONFLICT.';
