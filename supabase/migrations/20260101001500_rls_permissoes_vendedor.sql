-- =============================================================================
-- Estende as policies "*_staff_tudo" para também aceitar vendedores com a
-- permissão de cargo correspondente (via tem_permissao()).
--
-- Sem isso, um vendedor autorizado pela Server Action (exigirPermissao)
-- esbarraria na RLS mesmo assim — a barreira real de dados fica na RLS, a
-- checagem na Server Action é só uma antecipação de erro (defesa em
-- profundidade nos dois sentidos).
--
-- Mapeamento tabela -> permissão:
--   veiculos, veiculo_fotos, veiculo_precos_historico -> estoque.editar
--   aportes                                            -> aportes.confirmar
--   planos                                             -> clientes.criar
--   reservas, propostas                                -> reservas.gerenciar
--   notificacoes                                       -> notificacoes.gerenciar
--
-- cargos, permissoes, cargo_permissoes, comissoes, audit_log e profiles
-- continuam exclusivos de is_staff() — gerenciar quem tem o quê, ver dados
-- financeiros consolidados de outros vendedores, ou auditoria bruta não são
-- delegáveis por permissão de cargo.
-- =============================================================================

drop policy veiculos_staff_tudo on public.veiculos;
create policy veiculos_staff_tudo on public.veiculos
  for all to authenticated
  using (public.tem_permissao('estoque.editar'))
  with check (public.tem_permissao('estoque.editar'));

drop policy veiculo_fotos_staff_tudo on public.veiculo_fotos;
create policy veiculo_fotos_staff_tudo on public.veiculo_fotos
  for all to authenticated
  using (public.tem_permissao('estoque.editar'))
  with check (public.tem_permissao('estoque.editar'));

drop policy veiculo_precos_historico_staff_tudo on public.veiculo_precos_historico;
create policy veiculo_precos_historico_staff_tudo on public.veiculo_precos_historico
  for all to authenticated
  using (public.tem_permissao('estoque.editar'))
  with check (public.tem_permissao('estoque.editar'));

drop policy aportes_staff_tudo on public.aportes;
create policy aportes_staff_tudo on public.aportes
  for all to authenticated
  using (public.tem_permissao('aportes.confirmar'))
  with check (public.tem_permissao('aportes.confirmar'));

drop policy planos_staff_tudo on public.planos;
create policy planos_staff_tudo on public.planos
  for all to authenticated
  using (public.tem_permissao('clientes.criar'))
  with check (public.tem_permissao('clientes.criar'));

drop policy reservas_staff_tudo on public.reservas;
create policy reservas_staff_tudo on public.reservas
  for all to authenticated
  using (public.tem_permissao('reservas.gerenciar'))
  with check (public.tem_permissao('reservas.gerenciar'));

drop policy propostas_staff_tudo on public.propostas;
create policy propostas_staff_tudo on public.propostas
  for all to authenticated
  using (public.tem_permissao('reservas.gerenciar'))
  with check (public.tem_permissao('reservas.gerenciar'));

drop policy notificacoes_staff_tudo on public.notificacoes;
create policy notificacoes_staff_tudo on public.notificacoes
  for all to authenticated
  using (public.tem_permissao('notificacoes.gerenciar'))
  with check (public.tem_permissao('notificacoes.gerenciar'));

-- profiles: vendedor com 'clientes.criar' precisa LER profiles de clientes (a
-- tela de clientes faz join profiles!planos_cliente_id_fkey). Sem escrita —
-- criar/editar profile de outro usuário continua exclusivo de staff (a
-- criação de cliente/vendedor passa pela Admin API com service_role, que
-- ignora RLS de qualquer forma).
create policy profiles_vendedor_le_clientes on public.profiles
  for select to authenticated
  using (public.tem_permissao('clientes.criar') and papel = 'cliente');
