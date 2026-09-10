-- =============================================================================
-- Taxa de juros mensal configurável (feature pedida após a Fase 4):
--
--   - Taxa GLOBAL: chave `taxa_juros_mensal_padrao` em `configuracoes`,
--     editável pelo admin. Usada quando o plano não tem taxa própria.
--   - Taxa POR CLIENTE: coluna `planos.taxa_juros_mensal` (nullable).
--     Quando preenchida, SOBRESCREVE a taxa global só para aquele plano
--     (decisão do usuário: "taxa do cliente sobrescreve a global").
--
-- A resolução (plano.taxa_juros_mensal ?? configuracoes.taxa_juros_mensal_padrao)
-- é feita tanto em SQL (função `taxa_juros_do_plano`) quanto no servidor
-- Next.js (lib/dados/taxa-juros.ts), para as duas pontas concordarem.
-- =============================================================================

alter table public.planos
  add column taxa_juros_mensal numeric(6, 5);

comment on column public.planos.taxa_juros_mensal is
  'Taxa de juros mensal específica deste plano (ex.: 0.02000 = 2% a.m.). '
  'NULL = usa a taxa global (configuracoes.taxa_juros_mensal_padrao). '
  'Quando preenchida, sobrescreve a taxa global só para este cliente.';

alter table public.planos
  add constraint planos_taxa_juros_faixa check (
    taxa_juros_mensal is null or (taxa_juros_mensal >= 0 and taxa_juros_mensal <= 1)
  );

insert into public.configuracoes (chave, valor, descricao) values
  ('taxa_juros_mensal_padrao', '0.02', 'Taxa de juros mensal padrão (fração, ex.: 0.02 = 2% a.m.) aplicada na simulação de promissória quando o plano do cliente não tem taxa própria definida.')
on conflict (chave) do nothing;


-- -----------------------------------------------------------------------------
-- Função de resolução da taxa efetiva de um plano. Único ponto de verdade em
-- SQL — espelhada em TypeScript por lib/dados/taxa-juros.ts.
-- -----------------------------------------------------------------------------
create or replace function public.taxa_juros_do_plano(p_plano_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select pl.taxa_juros_mensal from public.planos pl where pl.id = p_plano_id),
    (select c.valor::numeric from public.configuracoes c where c.chave = 'taxa_juros_mensal_padrao'),
    0.02 -- fallback final se a chave global também sumir por algum motivo
  )
$$;

comment on function public.taxa_juros_do_plano(uuid) is
  'Taxa de juros mensal efetiva de um plano: taxa própria do plano, ou a taxa global de configuracoes, ou 0.02 como último fallback.';

grant execute on function public.taxa_juros_do_plano(uuid) to authenticated;
