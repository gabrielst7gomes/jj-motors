-- =============================================================================
-- 00 — Extensões e utilitários base
-- =============================================================================

create extension if not exists "pgcrypto" with schema extensions;      -- gen_random_uuid
create extension if not exists "pg_trgm"  with schema extensions;      -- busca por marca/modelo
create extension if not exists "moddatetime" with schema extensions;   -- trigger de updated_at (uso futuro)

-- -----------------------------------------------------------------------------
-- Função utilitária: arredondamento monetário "half up" sobre bigint.
--
-- A regra de negócio 3.3 pede ROUND(preco_venda_centavos * percentual_minimo).
-- Como preco_venda_centavos é bigint (centavos) e percentual_minimo é
-- numeric(4,3) (ex.: 0.500), o produto é numeric. Padronizamos o arredondamento
-- como HALF-UP (metade para cima), que casa exatamente com Math.floor(x + 0.5)
-- da função pura em TypeScript (lib/elegibilidade.ts) para valores positivos.
--
-- ROUND() do Postgres para numeric já é half-away-from-zero; para valores
-- sempre positivos isso é idêntico a half-up. Encapsulamos numa função para
-- deixar a semântica explícita e o call-site legível.
-- -----------------------------------------------------------------------------
create or replace function public.meta_centavos(
  preco_venda_centavos bigint,
  percentual_minimo numeric
)
returns bigint
language sql
immutable
parallel safe
as $$
  select round(preco_venda_centavos::numeric * percentual_minimo)::bigint;
$$;

comment on function public.meta_centavos(bigint, numeric) is
  'Valor mínimo de saldo (em centavos) para elegibilidade: ROUND(preco * percentual), half-up.';
