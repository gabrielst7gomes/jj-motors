-- =============================================================================
-- Casamento de preferência de veículo com estoque novo — independente de
-- elegibilidade de saldo (decisão do usuário: "mesmo que ele não tenha os
-- 50%, às vezes ele pode antecipar"). Roda junto com
-- enfileirar_notificacoes_veiculo no mesmo gatilho de veículo criado/reaberto.
--
-- Match: marca + modelo (case-insensitive), ano dentro da faixa quando
-- informada. Cliente que JÁ recebeu 'novo_elegivel' (por ter saldo
-- suficiente) não recebe também 'preferencia_disponivel' para o mesmo
-- veículo — o UNIQUE(cliente_id, veiculo_id, tipo) já cobre isso porque são
-- tipos diferentes, então tratamos explicitamente para não duplicar aviso.
-- =============================================================================

create or replace function public.enfileirar_notificacoes_preferencia(
  p_veiculo_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qtd integer := 0;
  v_veiculo public.veiculos%rowtype;
begin
  select * into v_veiculo from public.veiculos where id = p_veiculo_id;
  if not found or v_veiculo.status <> 'disponivel' then
    return 0;
  end if;

  with casamentos as (
    select distinct
      pl.cliente_id,
      pv.id as preferencia_id
    from public.preferencias_veiculo pv
    join public.planos pl on pl.id = pv.plano_id and pl.status = 'ativo'
    where pv.ativa
      and lower(pv.marca) = lower(v_veiculo.marca)
      and lower(pv.modelo) = lower(v_veiculo.modelo)
      and (pv.ano_min is null or v_veiculo.ano_modelo >= pv.ano_min)
      and (pv.ano_max is null or v_veiculo.ano_modelo <= pv.ano_max)
      -- não duplica aviso se o cliente já é elegível (já recebeu/vai
      -- receber 'novo_elegivel' pelo enfileirar_notificacoes_veiculo).
      and not exists (
        select 1
        from public.vw_saldo_cliente s
        where s.plano_id = pl.id
          and s.saldo_confirmado_centavos >= public.meta_centavos(v_veiculo.preco_venda_centavos, pl.percentual_minimo)
      )
  ),
  inseridos as (
    insert into public.notificacoes (cliente_id, veiculo_id, tipo, canal, template, payload, status)
    select
      c.cliente_id,
      p_veiculo_id,
      'preferencia_disponivel',
      'whatsapp',
      'veiculo_da_preferencia_chegou',
      jsonb_build_object(
        'marca', v_veiculo.marca,
        'modelo', v_veiculo.modelo,
        'preco_venda_centavos', v_veiculo.preco_venda_centavos,
        'preferencia_id', c.preferencia_id
      ),
      'fila'
    from casamentos c
    on conflict (cliente_id, veiculo_id, tipo) do nothing
    returning 1
  )
  select count(*) into v_qtd from inseridos;

  return v_qtd;
end;
$$;

comment on function public.enfileirar_notificacoes_preferencia(uuid) is
  'Enfileira notificação para clientes com preferência de marca/modelo casando com o veículo, mesmo sem elegibilidade de saldo (CRM de desejo, não só saldo).';

-- Estende os dois triggers existentes para também rodar o casamento por
-- preferência, no mesmo gatilho (criado disponível / reaberto).
create or replace function public.veiculos_trigger_notif_insert()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'disponivel' then
    perform public.enfileirar_notificacoes_veiculo(new.id, 'novo_elegivel', 'novo_veiculo_elegivel');
    perform public.enfileirar_notificacoes_preferencia(new.id);
  end if;
  return null;
end;
$$;

create or replace function public.veiculos_trigger_notif_update()
returns trigger
language plpgsql
as $$
begin
  -- (c) reabertura de estoque
  if old.status = 'reservado' and new.status = 'disponivel' then
    perform public.enfileirar_notificacoes_veiculo(new.id, 'reaberto', 'veiculo_reaberto');
    perform public.enfileirar_notificacoes_preferencia(new.id);
  end if;

  -- (b) redução de preço (só quando continua disponível)
  if new.status = 'disponivel'
     and new.preco_venda_centavos < old.preco_venda_centavos then
    perform public.enfileirar_notificacoes_veiculo(new.id, 'preco_reduzido', 'preco_reduzido');
  end if;

  return null;
end;
$$;
