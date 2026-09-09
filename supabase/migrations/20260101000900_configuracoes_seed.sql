-- =============================================================================
-- 60 — Parâmetros globais (configuracoes)
--
-- Estes vão como migration (não seed) porque são estruturais: a aplicação e as
-- funções SQL leem estas chaves. O seed de dados de exemplo fica em seed.sql.
-- =============================================================================

insert into public.configuracoes (chave, valor, descricao) values
  ('percentual_padrao',       '0.50', 'Fração default do preço de venda exigida como saldo para elegibilidade (usada ao criar plano sem valor explícito).'),
  ('horas_reserva',           '72',   'Prazo de expiração de uma reserva, em horas.'),
  ('limite_notificacoes_dia', '3',    'Máximo de notificações enviadas por cliente por dia (rate limit do worker).')
on conflict (chave) do nothing;
