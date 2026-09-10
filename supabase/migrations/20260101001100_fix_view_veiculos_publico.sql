-- =============================================================================
-- Correção: vw_veiculos_publico e vw_elegibilidade nunca devolviam linhas
-- (ou devolviam de menos) para clientes.
--
-- DIAGNÓSTICO (encontrado rodando supabase/tests/rls.test.sql e depois um
-- smoke test end-to-end contra um banco real): as duas views foram criadas
-- com security_invoker = true. Isso faz a view rodar com as permissões de
-- quem CONSULTA, não de quem a criou. Como a tabela `veiculos` não tem
-- nenhuma policy de SELECT para o papel 'cliente' (só staff), toda consulta
-- que junta `veiculos` — direta (vw_veiculos_publico) ou via cross join
-- (vw_elegibilidade) — perdia essas linhas para um cliente autenticado.
--
-- CORREÇÃO — vw_veiculos_publico: recriada SEM security_invoker (default do
-- Postgres: a view roda com o privilégio de quem a definiu, ignorando a RLS
-- de quem consulta). Seguro porque:
--   1. A tabela `veiculos` continua SEM nenhuma policy de SELECT para
--      cliente — ele não ganha acesso direto à tabela, só à view.
--   2. RLS filtra LINHAS, nunca colunas. A ocultação de
--      preco_custo_centavos, chassi, renavam e placa completa já era (e
--      continua sendo) garantida pela PROJEÇÃO da própria view, não pela
--      RLS. Remover security_invoker não expõe nada que a view já não
--      decidisse mostrar.
--   3. O filtro `where status in ('disponivel', 'reservado')` continua
--      sendo a única regra de visibilidade de linha, aplicada sempre.
--
-- CORREÇÃO — vw_elegibilidade: este caso é mais delicado porque a view junta
-- `vw_saldo_cliente` (que PRECISA continuar respeitando RLS de `planos` —
-- cada cliente só pode ver o PRÓPRIO saldo) com `veiculos` (que precisa
-- IGNORAR RLS aqui, pelo mesmo motivo do caso anterior). security_invoker é
-- um flag por view, não por tabela referenciada — não dá para ter "meio a
-- meio" dentro da mesma view. A solução: security_invoker = false (ignora
-- RLS de tudo, incluindo `planos`) + um filtro explícito por
-- `cliente_id = auth.uid() or is_staff()` escrito na própria definição da
-- view, substituindo a garantia que antes vinha da RLS de `planos`.
-- =============================================================================

drop view if exists public.vw_veiculos_publico;

create view public.vw_veiculos_publico
with (security_invoker = false) as
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

comment on view public.vw_veiculos_publico is
  'Estoque visível ao cliente: sem preco_custo/chassi/renavam, placa mascarada, só disponivel/reservado. '
  'SEM security_invoker (propositalmente) — ver comentário da migration 20260101001100 para o porquê.';

-- Grants explícitos: staff já tem acesso total à tabela `veiculos`
-- diretamente; aqui garantimos que authenticated (inclui cliente) pode
-- consultar a view mesmo sem policy na tabela base.
grant select on public.vw_veiculos_publico to authenticated;


-- -----------------------------------------------------------------------------
-- vw_elegibilidade — recriada com security_invoker = false + filtro embutido.
--
-- Com security_invoker = false a view ignora RLS de TODAS as tabelas que
-- referencia, inclusive `planos` (via vw_saldo_cliente). Sem RLS para conter
-- o vazamento entre clientes, o filtro `cliente_id = auth.uid()` abaixo passa
-- a ser a ÚNICA barreira, e é aplicado sempre, antes de qualquer outra
-- condição — staff (sem esse filtro) continua vendo tudo via `is_staff()`.
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
where v.status = 'disponivel'
  -- Barreira de isolamento entre clientes (substitui a RLS de `planos`, que
  -- security_invoker = false desativa para esta view): cliente só vê linhas
  -- do próprio cliente_id; staff vê tudo.
  and (s.cliente_id = auth.uid() or public.is_staff());

comment on view public.vw_elegibilidade is
  'Cruzamento plano ativo × veículo disponível com elegivel e valor_faltante_centavos. '
  'SEM security_invoker + filtro cliente_id = auth.uid() embutido — ver migration 20260101001100.';

grant select on public.vw_elegibilidade to authenticated;


-- -----------------------------------------------------------------------------
-- veiculo_fotos_cliente_le tinha o MESMO bug de raiz: a subquery
-- `exists (select 1 from public.veiculos v where ...)` dentro de uma policy
-- de RLS é avaliada com a RLS de `veiculos` aplicada ao papel atual — como
-- cliente não tem policy de SELECT em `veiculos`, o exists nunca encontrava
-- nada e a policy sempre negava.
--
-- Correção: função SECURITY DEFINER que verifica o status ignorando RLS
-- (mesmo padrão de is_staff()/plano_e_meu() já usados nas outras policies),
-- e a policy passa a chamar essa função em vez de fazer a subquery direta.
-- -----------------------------------------------------------------------------
create or replace function public.veiculo_e_publico(p_veiculo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.veiculos v
    where v.id = p_veiculo_id
      and v.status in ('disponivel', 'reservado')
  )
$$;

comment on function public.veiculo_e_publico(uuid) is
  'true se o veículo está disponível/reservado. SECURITY DEFINER para ser usável em policies de RLS de outras tabelas (ex.: veiculo_fotos) sem depender da RLS de veiculos, que não tem policy de SELECT para cliente.';

drop policy if exists veiculo_fotos_cliente_le on public.veiculo_fotos;

create policy veiculo_fotos_cliente_le on public.veiculo_fotos
  for select to authenticated
  using (public.veiculo_e_publico(veiculo_id));
