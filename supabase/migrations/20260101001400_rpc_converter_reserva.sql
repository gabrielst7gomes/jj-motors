-- =============================================================================
-- RPC transacional: converte uma reserva ativa em venda.
--
-- Substitui o antigo fluxo solto "marcar veículo como vendido" — agora só é
-- possível vender a partir de uma RESERVA ATIVA (decisão do usuário), porque
-- é a reserva que sabe qual plano/cliente comprou, e portanto qual vendedor
-- (planos.vendedor_id) tem direito à comissão.
--
-- Efeitos, em uma única transação com lock:
--   1. reserva: 'ativa' -> 'convertida'
--   2. veiculo: 'reservado' -> 'vendido'
--   3. se o plano tiver vendedor_id: cria um registro em `comissoes`
--      (status 'pendente'), percentual vindo do cargo do vendedor.
--   4. audit_log da conversão.
-- =============================================================================

create or replace function public.converter_reserva_em_venda(p_reserva_id uuid)
returns public.comissoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reserva     public.reservas%rowtype;
  v_veiculo     public.veiculos%rowtype;
  v_plano       public.planos%rowtype;
  v_percentual  numeric;
  v_valor       bigint;
  v_comissao    public.comissoes%rowtype;
  v_uid         uuid := auth.uid();
begin
  if not public.tem_permissao('reservas.gerenciar') then
    raise exception 'Sem permissão para gerenciar reservas' using errcode = '42501';
  end if;

  -- Lock na reserva primeiro, depois no veículo — ordem consistente evita deadlock
  -- com criar_reserva (que só lockeia veículo, então não há conflito de ordem).
  select * into v_reserva from public.reservas where id = p_reserva_id for update;
  if not found then
    raise exception 'Reserva não encontrada' using errcode = 'P0010';
  end if;
  if v_reserva.status <> 'ativa' then
    raise exception 'Reserva não está ativa (status: %)', v_reserva.status using errcode = 'P0011';
  end if;

  select * into v_veiculo from public.veiculos where id = v_reserva.veiculo_id for update;
  if not found or v_veiculo.status <> 'reservado' then
    raise exception 'Veículo não está reservado (status: %)', coalesce(v_veiculo.status::text, 'inexistente')
      using errcode = 'P0012';
  end if;

  select * into v_plano from public.planos where id = v_reserva.plano_id;

  update public.reservas set status = 'convertida' where id = p_reserva_id;
  update public.veiculos set status = 'vendido' where id = v_reserva.veiculo_id;

  insert into public.audit_log (usuario_id, acao, entidade, entidade_id, dados_antes, dados_depois)
  values (
    v_uid, 'converter_reserva_em_venda', 'reservas', p_reserva_id,
    jsonb_build_object('status', 'ativa'),
    jsonb_build_object('status', 'convertida', 'veiculo_id', v_reserva.veiculo_id)
  );

  -- Comissão só é gerada se o plano tiver um vendedor vinculado.
  if v_plano.vendedor_id is not null then
    select coalesce(c.percentual_comissao, 0) into v_percentual
    from public.profiles p
    left join public.cargos c on c.id = p.cargo_id
    where p.id = v_plano.vendedor_id;

    v_percentual := coalesce(v_percentual, 0);
    v_valor := round(v_veiculo.preco_venda_centavos * v_percentual);

    insert into public.comissoes (
      vendedor_id, plano_id, veiculo_id, reserva_id,
      percentual, preco_venda_centavos, valor_centavos, status
    )
    values (
      v_plano.vendedor_id, v_plano.id, v_veiculo.id, p_reserva_id,
      v_percentual, v_veiculo.preco_venda_centavos, v_valor, 'pendente'
    )
    returning * into v_comissao;

    insert into public.audit_log (usuario_id, acao, entidade, entidade_id, dados_depois)
    values (
      v_uid, 'gerar_comissao', 'comissoes', v_comissao.id,
      jsonb_build_object(
        'vendedor_id', v_plano.vendedor_id,
        'percentual', v_percentual,
        'valor_centavos', v_valor
      )
    );
  end if;

  return v_comissao;
end;
$$;

comment on function public.converter_reserva_em_venda(uuid) is
  'Converte reserva ativa em venda: reserva->convertida, veículo->vendido, gera comissão pendente se o plano tiver vendedor. Requer permissão reservas.gerenciar.';

revoke all on function public.converter_reserva_em_venda(uuid) from public;
grant execute on function public.converter_reserva_em_venda(uuid) to authenticated;


-- -----------------------------------------------------------------------------
-- Marcar comissão como paga.
-- -----------------------------------------------------------------------------
create or replace function public.marcar_comissao_paga(p_comissao_id uuid)
returns public.comissoes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comissao public.comissoes%rowtype;
begin
  if not public.is_staff() then
    raise exception 'Apenas staff pode marcar comissões como pagas' using errcode = '42501';
  end if;

  update public.comissoes
    set status = 'paga', pago_em = now()
    where id = p_comissao_id and status = 'pendente'
    returning * into v_comissao;

  if not found then
    raise exception 'Comissão não encontrada ou já paga' using errcode = 'P0013';
  end if;

  insert into public.audit_log (usuario_id, acao, entidade, entidade_id, dados_depois)
  values (auth.uid(), 'marcar_comissao_paga', 'comissoes', p_comissao_id, jsonb_build_object('status', 'paga'));

  return v_comissao;
end;
$$;

revoke all on function public.marcar_comissao_paga(uuid) from public;
grant execute on function public.marcar_comissao_paga(uuid) to authenticated;
