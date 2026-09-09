-- =============================================================================
-- 40 — RPC transacional de reserva (esqueleto para a Fase 5)
--
-- A regra 3.4 exige transação com lock para não haver reserva dupla. Já deixamos
-- a função criada e com RLS/execução configuradas; a Fase 5 amplia validações,
-- audit_log e o cron de expiração.
-- =============================================================================

create or replace function public.criar_reserva(p_veiculo_id uuid)
returns public.reservas
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_plano        public.planos%rowtype;
  v_veiculo      public.veiculos%rowtype;
  v_horas        integer;
  v_meta         bigint;
  v_saldo        bigint;
  v_reserva      public.reservas%rowtype;
begin
  if v_uid is null then
    raise exception 'Não autenticado' using errcode = '28000';
  end if;

  -- Plano ativo do cliente autenticado.
  select * into v_plano
  from public.planos
  where cliente_id = v_uid and status = 'ativo'
  order by data_adesao
  limit 1;

  if not found then
    raise exception 'Cliente sem plano ativo' using errcode = 'P0001';
  end if;

  -- Lock pessimista na linha do veículo: serializa reservas concorrentes.
  select * into v_veiculo
  from public.veiculos
  where id = p_veiculo_id
  for update;

  if not found then
    raise exception 'Veículo não encontrado' using errcode = 'P0002';
  end if;

  if v_veiculo.status <> 'disponivel' then
    raise exception 'Veículo não está disponível (status: %)', v_veiculo.status using errcode = 'P0003';
  end if;

  -- Revalida elegibilidade no servidor (nunca confia no client).
  v_meta := public.meta_centavos(v_veiculo.preco_venda_centavos, v_plano.percentual_minimo);

  select saldo_confirmado_centavos into v_saldo
  from public.vw_saldo_cliente
  where plano_id = v_plano.id;

  if coalesce(v_saldo, 0) < v_meta then
    raise exception 'Saldo insuficiente: falta % centavos', v_meta - coalesce(v_saldo, 0)
      using errcode = 'P0004';
  end if;

  -- Prazo de expiração configurável.
  select coalesce((select valor::integer from public.configuracoes where chave = 'horas_reserva'), 72)
    into v_horas;

  insert into public.reservas (plano_id, veiculo_id, status, expira_em)
  values (v_plano.id, p_veiculo_id, 'ativa', now() + make_interval(hours => v_horas))
  returning * into v_reserva;

  update public.veiculos set status = 'reservado' where id = p_veiculo_id;

  insert into public.audit_log (usuario_id, acao, entidade, entidade_id, dados_depois)
  values (v_uid, 'criar_reserva', 'reservas', v_reserva.id, to_jsonb(v_reserva));

  return v_reserva;
end;
$$;

comment on function public.criar_reserva(uuid) is
  'Cria reserva de veículo em transação com lock. Revalida status e elegibilidade no servidor. Ampliada na Fase 5.';

-- Cliente pode executar; staff também. Anônimo não.
revoke all on function public.criar_reserva(uuid) from public;
grant execute on function public.criar_reserva(uuid) to authenticated;
