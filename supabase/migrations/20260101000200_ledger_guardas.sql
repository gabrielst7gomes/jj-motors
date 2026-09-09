-- =============================================================================
-- 15 — Guardas do ledger append-only + histórico de preço + auditoria automática
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Ledger append-only: uma vez CONFIRMADO ou REJEITADO, um aporte é imutável.
-- Enquanto 'pendente' pode ser editado (ex.: corrigir valor antes de confirmar)
-- ou deletado. Depois disso: só via novo lançamento de estorno.
-- -----------------------------------------------------------------------------
create or replace function public.aportes_bloqueia_mutacao()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'pendente' then
      raise exception 'Aporte % está % e não pode ser removido. Use um lançamento de estorno.', old.id, old.status
        using errcode = 'check_violation';
    end if;
    return old;
  end if;

  -- UPDATE
  if old.status <> 'pendente' then
    -- Só permitimos a transição de status pendente -> confirmado|rejeitado e a
    -- gravação dos campos de confirmação. Qualquer outra alteração é barrada.
    if old.status = 'confirmado' or old.status = 'rejeitado' then
      raise exception 'Aporte % está % (imutável). Correção só via estorno.', old.id, old.status
        using errcode = 'check_violation';
    end if;
  end if;

  -- Bloqueia mudança de campos estruturais mesmo em pendente.
  if new.plano_id <> old.plano_id
     or new.estorno_de_id is distinct from old.estorno_de_id
     or new.criado_em <> old.criado_em then
    raise exception 'Campos estruturais do aporte % não podem ser alterados.', old.id
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger aportes_guarda_mutacao
  before update or delete on public.aportes
  for each row
  execute function public.aportes_bloqueia_mutacao();


-- -----------------------------------------------------------------------------
-- Histórico de preço de veículo: registra toda alteração de preco_venda_centavos.
-- O gatilho de notificação (preço reduzido) fica em 50_triggers_notificacao.sql.
-- -----------------------------------------------------------------------------
create or replace function public.veiculos_registra_preco()
returns trigger
language plpgsql
as $$
begin
  if new.preco_venda_centavos is distinct from old.preco_venda_centavos then
    insert into public.veiculo_precos_historico (
      veiculo_id, preco_anterior_centavos, preco_novo_centavos, alterado_por
    )
    values (
      new.id,
      old.preco_venda_centavos,
      new.preco_venda_centavos,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger veiculos_historico_preco
  after update on public.veiculos
  for each row
  when (old.preco_venda_centavos is distinct from new.preco_venda_centavos)
  execute function public.veiculos_registra_preco();
