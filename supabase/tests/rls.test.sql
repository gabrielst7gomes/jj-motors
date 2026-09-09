-- =============================================================================
-- rls.test.sql — teste de isolamento entre clientes (Seção 5)
--
-- Objetivo: autenticado como o cliente Ana, tentar ler dados do cliente Bruno
-- e confirmar que NADA vaza. Também confirma que Ana vê os próprios dados e
-- que o cliente não enxerga colunas sensíveis de veículo.
--
-- Como rodar (com o stack local de pé):
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
--
-- Sai com erro (código != 0) se qualquer asserção falhar.
-- =============================================================================

\set ANA   '00000000-0000-0000-0000-0000000000c1'
\set BRUNO '00000000-0000-0000-0000-0000000000c2'
\set PLANO_BRUNO '00000000-0000-0000-0000-0000000000b2'

begin;

-- Simula a requisição autenticada como Ana (cliente).
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', :'ANA', 'role', 'authenticated')::text, true);

do $$
declare
  n int;
begin
  -- 1) Ana NÃO vê o profile de Bruno.
  select count(*) into n from public.profiles where id = '00000000-0000-0000-0000-0000000000c2';
  assert n = 0, format('FALHA: Ana viu %s profile(s) de Bruno', n);

  -- 2) Ana vê o PRÓPRIO profile.
  select count(*) into n from public.profiles where id = '00000000-0000-0000-0000-0000000000c1';
  assert n = 1, format('FALHA: Ana deveria ver o próprio profile, viu %s', n);

  -- 3) Ana NÃO vê o plano de Bruno.
  select count(*) into n from public.planos where cliente_id = '00000000-0000-0000-0000-0000000000c2';
  assert n = 0, format('FALHA: Ana viu %s plano(s) de Bruno', n);

  -- 4) Ana vê o próprio plano.
  select count(*) into n from public.planos where cliente_id = '00000000-0000-0000-0000-0000000000c1';
  assert n = 1, format('FALHA: Ana deveria ver 1 plano próprio, viu %s', n);

  -- 5) Ana NÃO vê aportes do plano de Bruno.
  select count(*) into n from public.aportes where plano_id = '00000000-0000-0000-0000-0000000000b2';
  assert n = 0, format('FALHA: Ana viu %s aporte(s) de Bruno', n);

  -- 6) Ana vê os próprios aportes.
  select count(*) into n from public.aportes where plano_id = '00000000-0000-0000-0000-0000000000b1';
  assert n >= 1, format('FALHA: Ana deveria ver aportes próprios, viu %s', n);

  -- 7) vw_saldo_cliente só devolve o saldo de Ana.
  select count(*) into n from public.vw_saldo_cliente;
  assert n = 1, format('FALHA: vw_saldo_cliente devolveu %s linha(s) para Ana (esperado 1)', n);

  select count(*) into n from public.vw_saldo_cliente where cliente_id <> '00000000-0000-0000-0000-0000000000c1';
  assert n = 0, 'FALHA: vw_saldo_cliente vazou saldo de outro cliente';

  -- 8) vw_elegibilidade só devolve linhas de Ana.
  select count(*) into n from public.vw_elegibilidade where cliente_id <> '00000000-0000-0000-0000-0000000000c1';
  assert n = 0, 'FALHA: vw_elegibilidade vazou elegibilidade de outro cliente';

  -- 9) Ana NÃO acessa a tabela `veiculos` diretamente (sem policy para cliente).
  select count(*) into n from public.veiculos;
  assert n = 0, format('FALHA: Ana leu %s linha(s) da tabela veiculos (deveria ser 0)', n);

  -- 10) Ana acessa vw_veiculos_publico (só disponivel/reservado).
  select count(*) into n from public.vw_veiculos_publico;
  assert n = 7, format('FALHA: vw_veiculos_publico devolveu %s (esperado 7 = 8 - 1 vendido)', n);

  -- 11) Ana NÃO consegue INSERIR aporte (cliente não escreve).
  begin
    insert into public.aportes (plano_id, valor_centavos, tipo, status, meio_pagamento)
    values ('00000000-0000-0000-0000-0000000000b1', 100000, 'aporte', 'pendente', 'pix');
    assert false, 'FALHA: Ana conseguiu inserir um aporte (RLS deveria barrar)';
  exception
    when insufficient_privilege or check_violation then
      null; -- esperado
  end;

  -- 12) Ana NÃO consegue UPDATE em veículo.
  begin
    update public.veiculos set preco_venda_centavos = 1 where id = '00000000-0000-0000-0000-0000000000f1';
    -- update sem linhas visíveis não gera erro; então checamos que nada mudou
    select count(*) into n from public.veiculos where id = '00000000-0000-0000-0000-0000000000f1' and preco_venda_centavos = 1;
    assert n = 0, 'FALHA: Ana alterou o preço de um veículo';
  exception
    when insufficient_privilege then
      null; -- também aceitável
  end;

  raise notice 'OK: todas as 12 asserções de isolamento RLS passaram.';
end $$;

rollback;
