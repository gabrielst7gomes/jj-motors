-- =============================================================================
-- Adiciona 'vendedor' ao enum papel_usuario.
--
-- Isolado em migration própria: ALTER TYPE ... ADD VALUE deve ser commitado
-- antes que o novo valor possa ser referenciado (ex.: em CHECK, em código
-- SQL de outra migration na mesma transação) — limite do Postgres, não do
-- Supabase CLI. A migration seguinte (20260101001301) já pode usar 'vendedor'
-- livremente.
-- =============================================================================

alter type public.papel_usuario add value if not exists 'vendedor';
