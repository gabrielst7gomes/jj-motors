-- =============================================================================
-- seed.sql — dados de exemplo para desenvolvimento
--
-- PRÉ-REQUISITO: rode `npm run db:seed-auth` ANTES do `supabase db reset`
-- para que os usuários (e seus profiles) já existam. Este arquivo referencia
-- os UUIDs fixos definidos em scripts/seed-auth.ts.
--
-- Cenário desenhado (regra: dados interessantes para as telas):
--   Ana  (c1)  -> já ELEGÍVEL para >= 2 veículos
--   Bruno(c2)  -> QUASE lá: falta pouco para 1 veículo
--   Carla(c3)  -> recém-começou: 1 aporte confirmado
--
-- Todos os planos com percentual_minimo = 0.500.
-- Valores em CENTAVOS.
-- =============================================================================

-- Idempotência: limpa dados de domínio (na ordem das FKs). NÃO mexe em profiles
-- nem auth.users (isso é responsabilidade do seed-auth).
truncate table
  public.audit_log,
  public.notificacoes,
  public.propostas,
  public.reservas,
  public.negociacoes,
  public.veiculo_precos_historico,
  public.veiculo_fotos,
  public.preferencias_veiculo,
  public.catalogo_modelos,
  public.aportes,
  public.planos,
  public.veiculos
restart identity cascade;


-- -----------------------------------------------------------------------------
-- VEÍCULOS (8)
-- -----------------------------------------------------------------------------
insert into public.veiculos
  (id, marca, modelo, versao, ano_fabricacao, ano_modelo, km, cor, combustivel, cambio,
   placa, chassi, renavam, preco_venda_centavos, preco_custo_centavos, status, destaque, publicado_em)
values
  ('00000000-0000-0000-0000-0000000000f1', 'Volkswagen', 'Gol', '1.0 MPI', 2018, 2019, 62000, 'Prata', 'Flex', 'Manual',
   'ABC1D23', '9BWZZZ377VT004251', '01234567890', 3800000, 3100000, 'disponivel', false, now() - interval '40 days'),

  ('00000000-0000-0000-0000-0000000000f2', 'Fiat', 'Argo', 'Drive 1.0', 2020, 2021, 41000, 'Branco', 'Flex', 'Manual',
   'DEF2G34', '9BD198271L1234567', '11234567891', 4500000, 3700000, 'disponivel', true, now() - interval '30 days'),

  ('00000000-0000-0000-0000-0000000000f3', 'Chevrolet', 'Onix', 'LT 1.0 Turbo', 2021, 2021, 35000, 'Preto', 'Flex', 'Automático',
   'GHI3J45', '9BGKS48R0MG123456', '21234567892', 6900000, 5900000, 'disponivel', true, now() - interval '20 days'),

  ('00000000-0000-0000-0000-0000000000f4', 'Hyundai', 'HB20', 'Vision 1.0', 2022, 2023, 22000, 'Cinza', 'Flex', 'Manual',
   'JKL4M56', '9BHBG51CAPP123456', '31234567893', 7200000, 6200000, 'disponivel', false, now() - interval '15 days'),

  ('00000000-0000-0000-0000-0000000000f5', 'Toyota', 'Corolla', 'XEI 2.0', 2019, 2020, 78000, 'Prata', 'Flex', 'Automático',
   'MNO5P67', '9BRBLWHEXK0123456', '41234567894', 11500000, 9800000, 'disponivel', true, now() - interval '10 days'),

  ('00000000-0000-0000-0000-0000000000f6', 'Jeep', 'Renegade', 'Longitude 1.3 T270', 2021, 2022, 46000, 'Branco', 'Flex', 'Automático',
   'PQR6S78', '988BD5EB7MK123456', '51234567895', 12900000, 11200000, 'disponivel', false, now() - interval '8 days'),

  ('00000000-0000-0000-0000-0000000000f7', 'Honda', 'Civic', 'EXL 2.0', 2018, 2018, 91000, 'Preto', 'Flex', 'Automático',
   'STU7V89', '93HFC2660JZ123456', '61234567896', 10500000, 9000000, 'disponivel', false, now() - interval '5 days'),

  ('00000000-0000-0000-0000-0000000000f8', 'Volkswagen', 'T-Cross', 'Comfortline 1.4 TSI', 2020, 2021, 53000, 'Cinza', 'Flex', 'Automático',
   'VWX8Y90', '9BWBH6BF7LP123456', '71234567897', 13200000, 11500000, 'vendido', false, now() - interval '60 days');

-- Fotos ILUSTRATIVAS (capa por veículo) — Unsplash, até a JJ Motors subir as
-- fotos reais via Storage. Uma por modelo para as telas não ficarem vazias.
insert into public.veiculo_fotos (veiculo_id, url, ordem, capa) values
  ('00000000-0000-0000-0000-0000000000f1', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&q=75', 0, true),
  ('00000000-0000-0000-0000-0000000000f2', 'https://images.unsplash.com/photo-1549927681-0b673b8243ab?w=1000&q=75', 0, true),
  ('00000000-0000-0000-0000-0000000000f3', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&q=75', 0, true),
  ('00000000-0000-0000-0000-0000000000f4', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1000&q=75', 0, true),
  ('00000000-0000-0000-0000-0000000000f5', 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1000&q=75', 0, true),
  ('00000000-0000-0000-0000-0000000000f6', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&q=75', 0, true),
  ('00000000-0000-0000-0000-0000000000f7', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&q=75', 0, true),
  ('00000000-0000-0000-0000-0000000000f8', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&q=75', 0, true);


-- -----------------------------------------------------------------------------
-- PLANOS (3, um por cliente)
-- -----------------------------------------------------------------------------
-- data_adesao: Ana e Bruno já passaram a carência de 3 meses; Carla NÃO
-- (aderiu há 1 mês) — cenário de teste para a carência.
insert into public.planos
  (id, cliente_id, codigo, status, percentual_minimo, veiculo_alvo_id, data_adesao, observacoes)
values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c1',
   'CP-2025-0001', 'ativo', 0.500,
   '00000000-0000-0000-0000-0000000000f3', current_date - interval '9 months',
   'Cliente pontual. Alvo: Onix, mas aberta a outras opções.'),

  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000c2',
   'CP-2025-0002', 'ativo', 0.500,
   '00000000-0000-0000-0000-0000000000f1', current_date - interval '7 months',
   'Alvo: Gol. Falta R$ 2.500,00 para cobrir a entrada.'),

  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000c3',
   'CP-2026-0003', 'ativo', 0.500,
   null, current_date - interval '1 month',
   'Adesão recente — ainda na carência de 3 meses.');


-- -----------------------------------------------------------------------------
-- APORTES (~20 lançamentos)
--
-- Metas de elegibilidade (percentual 0.50):
--   Gol   R$ 38.000 -> meta R$ 19.000  (1.900.000 centavos)
--   Argo  R$ 45.000 -> meta R$ 22.500  (2.250.000)
--   Onix  R$ 69.000 -> meta R$ 34.500  (3.450.000)
--   HB20  R$ 72.000 -> meta R$ 36.000  (3.600.000)
--
-- Ana (b1): 8 aportes confirmados de 300.000 + 1 ajuste de 50.000 = 2.450.000
--           confirmado -> elegível para Gol (meta 1.900.000) e Argo (2.250.000).
--           +1 aporte do mês corrente pendente.
-- Bruno (b2): 7 confirmados de 250.000 + 1 estorno de -100.000 = 1.650.000
--             confirmado -> falta 250.000 (R$ 2.500,00) para o Gol. +1 pendente.
-- Carla (b3): 1 confirmado de 300.000 + 1 pendente.
-- -----------------------------------------------------------------------------

-- ---- Ana (plano b1) --------------------------------------------------------
insert into public.aportes
  (id, plano_id, valor_centavos, tipo, status, meio_pagamento, data_competencia, confirmado_por, confirmado_em, criado_em)
values
  ('00000000-0000-0000-0000-00000000a101', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'confirmado', 'pix',      current_date - interval '8 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '8 months', now() - interval '8 months'),
  ('00000000-0000-0000-0000-00000000a102', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'confirmado', 'pix',      current_date - interval '7 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '7 months', now() - interval '7 months'),
  ('00000000-0000-0000-0000-00000000a103', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'confirmado', 'ted',      current_date - interval '6 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '6 months', now() - interval '6 months'),
  ('00000000-0000-0000-0000-00000000a104', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'confirmado', 'pix',      current_date - interval '5 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '5 months', now() - interval '5 months'),
  ('00000000-0000-0000-0000-00000000a105', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'confirmado', 'dinheiro', current_date - interval '4 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '4 months', now() - interval '4 months'),
  ('00000000-0000-0000-0000-00000000a106', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'confirmado', 'pix',      current_date - interval '3 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '3 months', now() - interval '3 months'),
  ('00000000-0000-0000-0000-00000000a107', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'confirmado', 'pix',      current_date - interval '2 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '2 months', now() - interval '2 months'),
  ('00000000-0000-0000-0000-00000000a108', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'confirmado', 'pix',      current_date - interval '1 month',  '00000000-0000-0000-0000-0000000000a1', now() - interval '1 month',  now() - interval '1 month'),
  -- ajuste positivo (ex.: bônus de campanha)
  ('00000000-0000-0000-0000-00000000a109', '00000000-0000-0000-0000-0000000000b1',  50000, 'ajuste', 'confirmado', 'outro',    current_date - interval '20 days',  '00000000-0000-0000-0000-0000000000a1', now() - interval '20 days',  now() - interval '20 days'),
  -- aporte do mês corrente ainda pendente de confirmação
  ('00000000-0000-0000-0000-00000000a110', '00000000-0000-0000-0000-0000000000b1', 300000, 'aporte', 'pendente',   'pix',      current_date,                       null,                                   null,                        now() - interval '2 days');
-- Ana confirmado = 8*300000 + 50000 = 2.450.000

-- ---- Bruno (plano b2) ------------------------------------------------------
insert into public.aportes
  (id, plano_id, valor_centavos, tipo, status, meio_pagamento, data_competencia, confirmado_por, confirmado_em, criado_em, estorno_de_id)
values
  ('00000000-0000-0000-0000-00000000a201', '00000000-0000-0000-0000-0000000000b2', 250000, 'aporte', 'confirmado', 'pix', current_date - interval '7 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '7 months', now() - interval '7 months', null),
  ('00000000-0000-0000-0000-00000000a202', '00000000-0000-0000-0000-0000000000b2', 250000, 'aporte', 'confirmado', 'pix', current_date - interval '6 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '6 months', now() - interval '6 months', null),
  ('00000000-0000-0000-0000-00000000a203', '00000000-0000-0000-0000-0000000000b2', 250000, 'aporte', 'confirmado', 'ted', current_date - interval '5 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '5 months', now() - interval '5 months', null),
  ('00000000-0000-0000-0000-00000000a204', '00000000-0000-0000-0000-0000000000b2', 250000, 'aporte', 'confirmado', 'pix', current_date - interval '4 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '4 months', now() - interval '4 months', null),
  ('00000000-0000-0000-0000-00000000a205', '00000000-0000-0000-0000-0000000000b2', 250000, 'aporte', 'confirmado', 'pix', current_date - interval '3 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '3 months', now() - interval '3 months', null),
  ('00000000-0000-0000-0000-00000000a206', '00000000-0000-0000-0000-0000000000b2', 250000, 'aporte', 'confirmado', 'pix', current_date - interval '2 months', '00000000-0000-0000-0000-0000000000a1', now() - interval '2 months', now() - interval '2 months', null),
  ('00000000-0000-0000-0000-00000000a207', '00000000-0000-0000-0000-0000000000b2', 250000, 'aporte', 'confirmado', 'pix', current_date - interval '1 month',  '00000000-0000-0000-0000-0000000000a1', now() - interval '1 month',  now() - interval '1 month',  null),
  -- estorno de parte de a207 (ex.: PIX devolvido parcialmente por erro de valor)
  ('00000000-0000-0000-0000-00000000a208', '00000000-0000-0000-0000-0000000000b2', -100000, 'estorno', 'confirmado', 'pix', current_date - interval '25 days', '00000000-0000-0000-0000-0000000000a1', now() - interval '25 days', now() - interval '25 days', '00000000-0000-0000-0000-00000000a207'),
  -- aporte do mês corrente pendente
  ('00000000-0000-0000-0000-00000000a209', '00000000-0000-0000-0000-0000000000b2', 250000, 'aporte', 'pendente', 'pix', current_date, null, null, now() - interval '1 day', null);
-- Bruno confirmado = 7*250000 - 100000 = 1.650.000  -> meta Gol 1.900.000 -> falta 250.000 (R$ 2.500,00)

-- ---- Carla (plano b3) -----------------------------------------------------
-- Cenário: aderiu há 1 mês, aportou 2 valores grandes e SOLTOS (nada de
-- mensal fixo) — já tem saldo pra cobrir a entrada de vários carros, mas
-- está na CARÊNCIA de 3 meses. Vê "Saldo pronto · liberam em DD/MM".
insert into public.aportes
  (id, plano_id, valor_centavos, tipo, status, meio_pagamento, data_competencia, confirmado_por, confirmado_em, criado_em)
values
  ('00000000-0000-0000-0000-00000000a301', '00000000-0000-0000-0000-0000000000b3', 1500000, 'aporte', 'confirmado', 'pix',      current_date - interval '20 days', '00000000-0000-0000-0000-0000000000a1', now() - interval '20 days', now() - interval '20 days'),
  ('00000000-0000-0000-0000-00000000a302', '00000000-0000-0000-0000-0000000000b3', 1200000, 'aporte', 'confirmado', 'dinheiro', current_date - interval '5 days',  '00000000-0000-0000-0000-0000000000a1', now() - interval '5 days',  now() - interval '5 days'),
  ('00000000-0000-0000-0000-00000000a303', '00000000-0000-0000-0000-0000000000b3',  400000, 'aporte', 'pendente',   'pix',      current_date,                      null,                                   null,                       now() - interval '2 days');
-- (o valor de a301 e a302 é o cenário oficial; num banco já semeado o ledger
--  é append-only, então ajustes viram lançamentos extras, não edições.)
-- Carla confirmado = 2.700.000 -> cobre Gol (meta 1.9M) e Argo (2.25M), mas
-- carência só termina 3 meses após a adesão.


-- -----------------------------------------------------------------------------
-- CATÁLOGO DE MODELOS PRÉ-FIXADOS (marca/modelo + faixa de anos)
-- O cliente escolhe daqui ao registrar a preferência; quando um veículo
-- desses entra no estoque, o cliente é notificado (mesmo sem ter os 50%).
-- -----------------------------------------------------------------------------
insert into public.catalogo_modelos (marca, modelo, ano_min, ano_max) values
  ('Chevrolet',  'Onix',          2018, 2024),
  ('Hyundai',    'HB20',          2018, 2024),
  ('Hyundai',    'Creta',         2021, 2024),
  ('Volkswagen', 'Gol',           2016, 2023),
  ('Volkswagen', 'Polo',          2018, 2024),
  ('Volkswagen', 'T-Cross',       2019, 2024),
  ('Fiat',       'Argo',          2018, 2024),
  ('Fiat',       'Pulse',         2021, 2024),
  ('Toyota',     'Corolla',       2018, 2024),
  ('Toyota',     'Corolla Cross', 2021, 2024),
  ('Honda',      'Civic',         2017, 2024),
  ('Honda',      'City',          2018, 2024),
  ('Jeep',       'Renegade',      2019, 2024),
  ('Jeep',       'Compass',       2019, 2024),
  ('Nissan',     'Kicks',         2019, 2024)
on conflict do nothing;


-- -----------------------------------------------------------------------------
-- PREFERÊNCIA DE VEÍCULO (CRM) — Ana já escolheu o Creta do catálogo.
-- Serve para o onboarding NÃO aparecer para ela (só para quem nunca preencheu).
-- -----------------------------------------------------------------------------
insert into public.preferencias_veiculo
  (plano_id, marca, modelo, ano_min, ano_max, valor_meta_centavos, catalogo_modelo_id)
select '00000000-0000-0000-0000-0000000000b1', cm.marca, cm.modelo, cm.ano_min, cm.ano_max,
       10000000, cm.id
from public.catalogo_modelos cm
where cm.marca = 'Hyundai' and cm.modelo = 'Creta'
on conflict do nothing;


-- -----------------------------------------------------------------------------
-- HISTÓRICO DE PREÇO (exemplo: Corolla teve redução)
-- -----------------------------------------------------------------------------
insert into public.veiculo_precos_historico
  (veiculo_id, preco_anterior_centavos, preco_novo_centavos, alterado_por, alterado_em)
values
  ('00000000-0000-0000-0000-0000000000f5', 12000000, 11500000, '00000000-0000-0000-0000-0000000000a1', now() - interval '9 days');


-- -----------------------------------------------------------------------------
-- Conferência rápida (aparece no output do `supabase db reset`)
-- -----------------------------------------------------------------------------
do $$
declare r record;
begin
  raise notice '--- Saldos confirmados por plano ---';
  for r in
    select plano_codigo, saldo_confirmado_centavos, saldo_pendente_centavos
    from public.vw_saldo_cliente order by plano_codigo
  loop
    raise notice 'Plano % | confirmado: % | pendente: %', r.plano_codigo, r.saldo_confirmado_centavos, r.saldo_pendente_centavos;
  end loop;

  raise notice '--- Veículos elegíveis por plano ---';
  for r in
    select plano_codigo, marca, modelo, elegivel, valor_faltante_centavos
    from public.vw_elegibilidade
    where elegivel or valor_faltante_centavos < 500000
    order by plano_codigo, preco_venda_centavos
  loop
    raise notice 'Plano % | % % | elegivel: % | falta: %', r.plano_codigo, r.marca, r.modelo, r.elegivel, r.valor_faltante_centavos;
  end loop;
end $$;
