-- =============================================================================
-- Novo tipo de notificação: casamento por preferência de veículo, sem exigir
-- elegibilidade de saldo (ver 20260101001600_preferencias_veiculo.sql).
-- Isolado em migration própria pelo mesmo motivo de
-- 20260101001300_enum_papel_vendedor.sql.
-- =============================================================================

alter type public.tipo_notificacao add value if not exists 'preferencia_disponivel';
