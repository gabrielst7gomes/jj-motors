-- =============================================================================
-- 30b — Row Level Security: ATIVAR em todas as tabelas + políticas (Seção 5)
--
-- Princípios:
--  - Staff (admin/operador): acesso total a tudo.
--  - Cliente: lê apenas o que é seu. Não escreve em nada (exceto via RPC).
--  - Cliente vê veículos só via vw_veiculos_publico (status disponivel/reservado,
--    sem colunas sensíveis). A tabela `veiculos` fica bloqueada para cliente.
-- =============================================================================

-- Ativa RLS. Sem política = nega tudo (o default é o que queremos para cliente).
alter table public.profiles                 enable row level security;
alter table public.veiculos                 enable row level security;
alter table public.planos                   enable row level security;
alter table public.aportes                  enable row level security;
alter table public.veiculo_fotos            enable row level security;
alter table public.veiculo_precos_historico enable row level security;
alter table public.reservas                 enable row level security;
alter table public.propostas                enable row level security;
alter table public.notificacoes             enable row level security;
alter table public.audit_log                enable row level security;
alter table public.configuracoes            enable row level security;

-- Força RLS inclusive para o dono das tabelas (defesa extra; service_role continua
-- ignorando RLS por ser BYPASSRLS).
alter table public.profiles                 force row level security;
alter table public.veiculos                 force row level security;
alter table public.planos                   force row level security;
alter table public.aportes                  force row level security;
alter table public.veiculo_fotos            force row level security;
alter table public.veiculo_precos_historico force row level security;
alter table public.reservas                 force row level security;
alter table public.propostas                force row level security;
alter table public.notificacoes             force row level security;
alter table public.audit_log                force row level security;
alter table public.configuracoes            force row level security;


-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create policy profiles_staff_tudo on public.profiles
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy profiles_cliente_le_o_seu on public.profiles
  for select to authenticated
  using (id = auth.uid());


-- -----------------------------------------------------------------------------
-- veiculos — cliente NÃO acessa a tabela (usa vw_veiculos_publico).
-- -----------------------------------------------------------------------------
create policy veiculos_staff_tudo on public.veiculos
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());


-- -----------------------------------------------------------------------------
-- planos
-- -----------------------------------------------------------------------------
create policy planos_staff_tudo on public.planos
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy planos_cliente_le_os_seus on public.planos
  for select to authenticated
  using (cliente_id = auth.uid());


-- -----------------------------------------------------------------------------
-- aportes — cliente lê os aportes dos seus planos; não escreve.
-- -----------------------------------------------------------------------------
create policy aportes_staff_tudo on public.aportes
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy aportes_cliente_le_dos_seus_planos on public.aportes
  for select to authenticated
  using (public.plano_e_meu(plano_id));


-- -----------------------------------------------------------------------------
-- veiculo_fotos — cliente lê fotos de veículos publicáveis.
-- -----------------------------------------------------------------------------
create policy veiculo_fotos_staff_tudo on public.veiculo_fotos
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy veiculo_fotos_cliente_le on public.veiculo_fotos
  for select to authenticated
  using (
    exists (
      select 1 from public.veiculos v
      where v.id = veiculo_fotos.veiculo_id
        and v.status in ('disponivel', 'reservado')
    )
  );


-- -----------------------------------------------------------------------------
-- veiculo_precos_historico — só staff.
-- -----------------------------------------------------------------------------
create policy veiculo_precos_historico_staff_tudo on public.veiculo_precos_historico
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());


-- -----------------------------------------------------------------------------
-- reservas — cliente lê as reservas dos seus planos; cria só via RPC.
-- -----------------------------------------------------------------------------
create policy reservas_staff_tudo on public.reservas
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy reservas_cliente_le_das_suas on public.reservas
  for select to authenticated
  using (public.plano_e_meu(plano_id));


-- -----------------------------------------------------------------------------
-- propostas — cliente lê as das suas reservas.
-- -----------------------------------------------------------------------------
create policy propostas_staff_tudo on public.propostas
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy propostas_cliente_le_das_suas on public.propostas
  for select to authenticated
  using (
    exists (
      select 1
      from public.reservas r
      where r.id = propostas.reserva_id
        and public.plano_e_meu(r.plano_id)
    )
  );


-- -----------------------------------------------------------------------------
-- notificacoes — cliente lê as suas.
-- -----------------------------------------------------------------------------
create policy notificacoes_staff_tudo on public.notificacoes
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy notificacoes_cliente_le_as_suas on public.notificacoes
  for select to authenticated
  using (cliente_id = auth.uid());


-- -----------------------------------------------------------------------------
-- audit_log — só staff lê. Escrita vem de funções SECURITY DEFINER / service_role.
-- -----------------------------------------------------------------------------
create policy audit_log_staff_le on public.audit_log
  for select to authenticated
  using (public.is_staff());


-- -----------------------------------------------------------------------------
-- configuracoes — cliente lê (parâmetros públicos como horas_reserva); só staff escreve.
-- -----------------------------------------------------------------------------
create policy configuracoes_todos_leem on public.configuracoes
  for select to authenticated
  using (true);

create policy configuracoes_staff_escreve on public.configuracoes
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());
