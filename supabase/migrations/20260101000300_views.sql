-- =============================================================================
-- 20 — Views
--
-- Todas com security_invoker = true: a view roda com as permissões de quem
-- consulta, respeitando a RLS das tabelas base. Isso é essencial para
-- vw_saldo_cliente / vw_elegibilidade não vazarem dados entre clientes.
--
-- CORREÇÃO POSTERIOR (ver migration 20260101001100_fix_view_veiculos_publico):
-- vw_veiculos_publico definida abaixo com security_invoker = true tem esse
-- flag revertido para false naquela migration. Motivo: a tabela `veiculos`
-- não tem policy de SELECT para cliente, então com security_invoker = true a
-- view ficava sempre vazia para cliente. vw_saldo_cliente e vw_elegibilidade
-- não são afetadas — partem de tabelas que TÊM policy de cliente — e
-- continuam com security_invoker = true.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- vw_saldo_cliente — saldo CONFIRMADO por plano.
--
-- Regra 3.2: o saldo é sempre a soma do ledger, nunca uma coluna denormalizada.
-- Só 'confirmado' entra. Estornos já têm valor negativo, então soma direta.
-- -----------------------------------------------------------------------------
create view public.vw_saldo_cliente
with (security_invoker = true) as
select
  p.id                                            as plano_id,
  p.cliente_id,
  p.codigo                                        as plano_codigo,
  p.percentual_minimo,
  coalesce(sum(a.valor_centavos) filter (where a.status = 'confirmado'), 0)::bigint
                                                  as saldo_confirmado_centavos,
  coalesce(sum(a.valor_centavos) filter (where a.status = 'pendente'), 0)::bigint
                                                  as saldo_pendente_centavos
from public.planos p
left join public.aportes a on a.plano_id = p.id
group by p.id, p.cliente_id, p.codigo, p.percentual_minimo;

comment on view public.vw_saldo_cliente is 'Saldo confirmado e pendente por plano, calculado do ledger.';


-- -----------------------------------------------------------------------------
-- vw_veiculos_publico — projeção do estoque SEM colunas sensíveis.
--
-- Regra RLS: cliente vê veículos com status in ('disponivel','reservado') e
-- NUNCA preco_custo_centavos, chassi, renavam. Placa vem mascarada.
-- Staff usa a tabela `veiculos` diretamente.
-- -----------------------------------------------------------------------------
create view public.vw_veiculos_publico
with (security_invoker = true) as
select
  v.id,
  v.marca,
  v.modelo,
  v.versao,
  v.ano_fabricacao,
  v.ano_modelo,
  v.km,
  v.cor,
  v.combustivel,
  v.cambio,
  -- Placa mascarada: 3 primeiros caracteres + resto oculto. Ex.: ABC1D23 -> ABC****
  case
    when v.placa is null then null
    else left(v.placa, 3) || repeat('*', greatest(length(v.placa) - 3, 0))
  end                                as placa_mascarada,
  v.preco_venda_centavos,
  v.status,
  v.destaque,
  v.publicado_em,
  v.criado_em
from public.veiculos v
where v.status in ('disponivel', 'reservado');

comment on view public.vw_veiculos_publico is 'Estoque visível ao cliente: sem preco_custo/chassi/renavam, placa mascarada, só disponivel/reservado.';


-- -----------------------------------------------------------------------------
-- vw_elegibilidade — produto plano × veículo DISPONÍVEL.
--
-- Regra 3.3:
--   meta_centavos   = ROUND(preco_venda_centavos * percentual_minimo)  [half-up]
--   elegivel        = saldo_confirmado >= meta_centavos
--   valor_faltante  = meta_centavos - saldo_confirmado   (>= 0; 0 quando elegível)
--
-- Só veículos 'disponivel' entram (regra 3.3 + reserva "some da lista dos demais").
-- Só planos com status 'ativo'.
-- -----------------------------------------------------------------------------
create view public.vw_elegibilidade
with (security_invoker = true) as
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
  (s.saldo_confirmado_centavos
     >= public.meta_centavos(v.preco_venda_centavos, s.percentual_minimo))
                                                   as elegivel,
  greatest(
    public.meta_centavos(v.preco_venda_centavos, s.percentual_minimo)
      - s.saldo_confirmado_centavos,
    0
  )::bigint                                        as valor_faltante_centavos
from public.vw_saldo_cliente s
join public.planos pl on pl.id = s.plano_id and pl.status = 'ativo'
cross join public.veiculos v
where v.status = 'disponivel';

comment on view public.vw_elegibilidade is 'Cruzamento plano ativo × veículo disponível com elegivel e valor_faltante_centavos.';
