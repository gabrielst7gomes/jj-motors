-- =============================================================================
-- 50 — Enfileiramento de notificações (esqueleto para a Fase 6)
--
-- Gatilhos (regra 3.5):
--   (a) veículo criado com status 'disponivel'      -> tipo 'novo_elegivel'
--   (b) preco_venda_centavos reduzido               -> tipo 'preco_reduzido'
--   (c) veículo volta de 'reservado' p/ 'disponivel' -> tipo 'reaberto'  (decisão A3)
--
-- A função insere uma linha em `notificacoes` (status 'fila') para cada cliente
-- com plano ativo que se tornou elegível para o veículo. ON CONFLICT DO NOTHING
-- respeita o UNIQUE(cliente_id, veiculo_id, tipo) -> dedupe.
--
-- Rate-limit diário (máx N por cliente/dia) é aplicado pelo WORKER (Fase 6), não
-- aqui, para não perder o registro na fila.
-- =============================================================================

create or replace function public.enfileirar_notificacoes_veiculo(
  p_veiculo_id uuid,
  p_tipo public.tipo_notificacao,
  p_template text
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

  with elegiveis as (
    select
      pl.cliente_id,
      pl.id as plano_id,
      public.meta_centavos(v_veiculo.preco_venda_centavos, pl.percentual_minimo) as meta,
      coalesce(s.saldo_confirmado_centavos, 0) as saldo
    from public.planos pl
    left join public.vw_saldo_cliente s on s.plano_id = pl.id
    where pl.status = 'ativo'
  ),
  inseridos as (
    insert into public.notificacoes (cliente_id, veiculo_id, tipo, canal, template, payload, status)
    select
      e.cliente_id,
      p_veiculo_id,
      p_tipo,
      'whatsapp',
      p_template,
      jsonb_build_object(
        'marca', v_veiculo.marca,
        'modelo', v_veiculo.modelo,
        'preco_venda_centavos', v_veiculo.preco_venda_centavos,
        'meta_centavos', e.meta,
        'saldo_centavos', e.saldo
      ),
      'fila'
    from elegiveis e
    where e.saldo >= e.meta
    on conflict (cliente_id, veiculo_id, tipo) do nothing
    returning 1
  )
  select count(*) into v_qtd from inseridos;

  return v_qtd;
end;
$$;

comment on function public.enfileirar_notificacoes_veiculo(uuid, public.tipo_notificacao, text) is
  'Enfileira notificações para clientes elegíveis a um veículo. Dedupe via ON CONFLICT. Rate-limit no worker.';


-- -----------------------------------------------------------------------------
-- Trigger AFTER INSERT: veículo novo já disponível.
-- -----------------------------------------------------------------------------
create or replace function public.veiculos_trigger_notif_insert()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'disponivel' then
    perform public.enfileirar_notificacoes_veiculo(new.id, 'novo_elegivel', 'novo_veiculo_elegivel');
  end if;
  return null;
end;
$$;

create trigger veiculos_notif_insert
  after insert on public.veiculos
  for each row
  execute function public.veiculos_trigger_notif_insert();


-- -----------------------------------------------------------------------------
-- Trigger AFTER UPDATE: preço reduzido OU volta de reservado -> disponivel.
-- -----------------------------------------------------------------------------
create or replace function public.veiculos_trigger_notif_update()
returns trigger
language plpgsql
as $$
begin
  -- (c) reabertura de estoque
  if old.status = 'reservado' and new.status = 'disponivel' then
    perform public.enfileirar_notificacoes_veiculo(new.id, 'reaberto', 'veiculo_reaberto');
  end if;

  -- (b) redução de preço (só quando continua disponível)
  if new.status = 'disponivel'
     and new.preco_venda_centavos < old.preco_venda_centavos then
    perform public.enfileirar_notificacoes_veiculo(new.id, 'preco_reduzido', 'preco_reduzido');
  end if;

  return null;
end;
$$;

create trigger veiculos_notif_update
  after update on public.veiculos
  for each row
  execute function public.veiculos_trigger_notif_update();
