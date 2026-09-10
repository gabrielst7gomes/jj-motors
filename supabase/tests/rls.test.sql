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

  -- 8) vw_elegibilidade só devolve linhas de Ana, e devolve TODAS as dela
  -- (regressão do bug: security_invoker=true fazia o cross join com
  -- `veiculos` zerar para cliente — ver migration 20260101001100).
  select count(*) into n from public.vw_elegibilidade where cliente_id <> '00000000-0000-0000-0000-0000000000c1';
  assert n = 0, 'FALHA: vw_elegibilidade vazou elegibilidade de outro cliente';

  select count(*) into n from public.vw_elegibilidade where cliente_id = '00000000-0000-0000-0000-0000000000c1';
  assert n = 7, format('FALHA: vw_elegibilidade deveria ter 7 linhas para Ana (7 veículos disponíveis), teve %s', n);

  select count(*) into n from public.vw_elegibilidade where cliente_id = '00000000-0000-0000-0000-0000000000c1' and elegivel;
  assert n = 2, format('FALHA: Ana deveria ser elegível para 2 veículos (Gol e Argo), o teste viu %s', n);

  -- 8b) Ana aderiu há 9 meses -> carência (3 meses) cumprida em todas as linhas.
  select count(*) into n from public.vw_elegibilidade
    where cliente_id = '00000000-0000-0000-0000-0000000000c1' and not carencia_ok;
  assert n = 0, format('FALHA: Ana (adesão há 9 meses) não deveria ter carencia_ok=false, tem %s', n);
  -- saldo_ok e elegivel batem para Ana (carência já passou).
  select count(*) into n from public.vw_elegibilidade
    where cliente_id = '00000000-0000-0000-0000-0000000000c1' and saldo_ok <> elegivel;
  assert n = 0, format('FALHA: para Ana, saldo_ok deveria ser igual a elegivel (carência ok), %s divergem', n);

  -- 9) Ana NÃO acessa a tabela `veiculos` diretamente (sem policy para cliente).
  select count(*) into n from public.veiculos;
  assert n = 0, format('FALHA: Ana leu %s linha(s) da tabela veiculos (deveria ser 0)', n);

  -- 10) Ana acessa vw_veiculos_publico (só disponivel/reservado).
  select count(*) into n from public.vw_veiculos_publico;
  assert n = 7, format('FALHA: vw_veiculos_publico devolveu %s (esperado 7 = 8 - 1 vendido)', n);

  -- 10b) Ana acessa veiculo_fotos dos veículos públicos (regressão do mesmo
  -- bug: a policy antiga usava uma subquery em `veiculos` sujeita à RLS de
  -- `veiculos`, que nega tudo para cliente — ver migration 20260101001100).
  select count(*) into n from public.veiculo_fotos;
  assert n = 7, format('FALHA: veiculo_fotos devolveu %s (esperado 7, uma por veículo disponível)', n);

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

  -- 13) Ana NÃO vê preferências de veículo (CRM) de Bruno.
  select count(*) into n from public.preferencias_veiculo
    where plano_id = '00000000-0000-0000-0000-0000000000b2';
  assert n = 0, format('FALHA: Ana viu %s preferência(s) de Bruno', n);

  -- 14) Ana NÃO consegue inserir preferência direto na tabela (só via RPC
  -- definir_preferencia_veiculo, que é SECURITY DEFINER).
  begin
    insert into public.preferencias_veiculo (plano_id, marca, modelo)
    values ('00000000-0000-0000-0000-0000000000b1', 'Toyota', 'Corolla');
    assert false, 'FALHA: Ana inseriu preferência direto na tabela (RLS deveria barrar)';
  exception
    when insufficient_privilege then
      null; -- esperado
  end;

  -- 15) A RPC definir_preferencia_veiculo (texto livre) funciona para Ana e
  -- ela consegue ler o que gravou.
  perform public.definir_preferencia_veiculo(
    p_marca => 'Peugeot', p_modelo => '208', p_valor_meta_centavos => 8000000
  );
  select count(*) into n from public.preferencias_veiculo
    where plano_id = '00000000-0000-0000-0000-0000000000b1' and marca = 'Peugeot' and modelo = '208';
  assert n = 1, format('FALHA: preferência livre gravada via RPC não apareceu para Ana, viu %s', n);

  -- 16) Ana lê o catálogo de modelos ativos (precisa para escolher).
  select count(*) into n from public.catalogo_modelos;
  assert n >= 1, 'FALHA: Ana não vê nenhum item do catálogo de modelos';

  -- 17) Ana NÃO consegue inserir no catálogo (só staff/vendedor c/ estoque.editar).
  begin
    insert into public.catalogo_modelos (marca, modelo) values ('Fiat', 'Uno');
    assert false, 'FALHA: Ana inseriu no catálogo (RLS deveria barrar)';
  exception
    when insufficient_privilege then
      null; -- esperado
  end;

  -- 18) A RPC aceita escolha do catálogo e copia marca/modelo/anos dele.
  declare
    v_cat_id uuid;
    v_pref public.preferencias_veiculo%rowtype;
  begin
    select id into v_cat_id from public.catalogo_modelos where ativo order by marca, modelo limit 1;
    v_pref := public.definir_preferencia_veiculo(p_catalogo_modelo_id => v_cat_id);
    assert v_pref.catalogo_modelo_id = v_cat_id,
      'FALHA: preferência do catálogo não guardou o vínculo';
  end;

  -- 19) Ana abre negociação de um veículo qualquer (não exige elegibilidade)
  -- e consegue ler a própria negociação; NÃO vê a de Bruno.
  declare
    v_veic uuid;
    v_negoc public.negociacoes%rowtype;
  begin
    -- Ana não tem policy em `veiculos`; usa a view pública (que ela pode ler).
    select id into v_veic from public.vw_veiculos_publico
      order by preco_venda_centavos desc limit 1; -- o mais caro (Ana não é elegível)
    v_negoc := public.abrir_negociacao(v_veic, 'tenho interesse');
    assert v_negoc.cliente_id = '00000000-0000-0000-0000-0000000000c1',
      'FALHA: negociação não foi criada para Ana';

    select count(*) into n from public.negociacoes
      where cliente_id = '00000000-0000-0000-0000-0000000000c1';
    assert n = 1, format('FALHA: Ana deveria ver 1 negociação própria, viu %s', n);

    select count(*) into n from public.negociacoes
      where cliente_id = '00000000-0000-0000-0000-0000000000c2';
    assert n = 0, format('FALHA: Ana viu %s negociação(ões) de Bruno', n);
  end;

  -- 20) Ana NÃO consegue inserir negociação direto na tabela (só via RPC).
  begin
    insert into public.negociacoes (veiculo_id, plano_id, cliente_id)
    values (
      (select id from public.vw_veiculos_publico limit 1),
      '00000000-0000-0000-0000-0000000000b1',
      '00000000-0000-0000-0000-0000000000c1'
    );
    assert false, 'FALHA: Ana inseriu negociação direto na tabela (RLS deveria barrar)';
  exception
    when insufficient_privilege then
      null; -- esperado
  end;

  raise notice 'OK: todas as 22 asserções de isolamento RLS passaram.';
end $$;

rollback;
