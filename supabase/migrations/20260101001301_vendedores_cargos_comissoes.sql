-- =============================================================================
-- Vendedores, cargos com permissões nomeadas, e comissões sobre venda.
--
-- Modelo (decisões do usuário):
--   - Comissão = % FIXO sobre o valor do veículo, gerada quando o veículo é
--     marcado como vendido a partir de uma reserva.
--   - Permissões: sistema de CARGOS nomeados (não toggles individuais por
--     vendedor) — o admin cria cargos (ex.: "Vendedor Júnior"), liga
--     permissões a cada cargo, e atribui vendedores a um cargo.
--   - 'operador' continua como está (staff de confiança, acesso total),
--     paralelo e independente do sistema de cargos — só 'vendedor' é
--     governado por cargo/permissão.
-- =============================================================================

-- Novo papel 'vendedor' já foi adicionado ao enum papel_usuario na migration
-- anterior (20260101001300_enum_papel_vendedor.sql) — precisa estar em
-- migration própria e commitada antes de ser usável aqui.

-- -----------------------------------------------------------------------------
-- cargos — cada cargo carrega seu próprio percentual de comissão.
-- -----------------------------------------------------------------------------
create table public.cargos (
  id                     uuid primary key default gen_random_uuid(),
  nome                   text not null unique,
  percentual_comissao    numeric(6, 5) not null default 0,
  descricao              text,
  criado_em              timestamptz not null default now(),

  constraint cargos_percentual_comissao_faixa check (percentual_comissao >= 0 and percentual_comissao <= 1)
);

comment on table public.cargos is 'Cargos atribuíveis a vendedores. Cada cargo tem seu percentual de comissão e um conjunto de permissões (cargo_permissoes).';


-- -----------------------------------------------------------------------------
-- permissoes — catálogo FIXO de permissões possíveis. Não editável pelo
-- admin em runtime (só via migration) — é a lista do que EXISTE para
-- permitir. O admin liga/desliga quais um cargo tem, não quais existem.
-- -----------------------------------------------------------------------------
create table public.permissoes (
  chave        text primary key,
  descricao    text not null
);

comment on table public.permissoes is 'Catálogo fixo de permissões que um cargo pode ter. Editar a lista requer migration.';

insert into public.permissoes (chave, descricao) values
  ('estoque.editar',          'Criar, editar e alterar preço de veículos no estoque.'),
  ('juros.editar',            'Alterar a taxa de juros global e a taxa por cliente.'),
  ('aportes.confirmar',       'Confirmar, rejeitar e estornar aportes.'),
  ('clientes.criar',          'Criar novos clientes e planos de compra programada.'),
  ('reservas.gerenciar',      'Criar, cancelar e converter (marcar vendido) reservas.'),
  ('notificacoes.gerenciar',  'Reenviar notificações e ver a fila/histórico completo.'),
  ('comissoes.ver_todas',     'Ver as comissões de todos os vendedores, não só as próprias.')
on conflict (chave) do nothing;


-- -----------------------------------------------------------------------------
-- cargo_permissoes — junção cargo × permissão (o "toggle" por cargo).
-- -----------------------------------------------------------------------------
create table public.cargo_permissoes (
  cargo_id        uuid not null references public.cargos (id) on delete cascade,
  permissao_chave text not null references public.permissoes (chave) on delete cascade,
  primary key (cargo_id, permissao_chave)
);


-- -----------------------------------------------------------------------------
-- profiles.cargo_id — só relevante para papel = 'vendedor'.
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column cargo_id uuid references public.cargos (id) on delete set null;

comment on column public.profiles.cargo_id is 'Cargo do vendedor (governa suas permissões). Só usado quando papel = vendedor.';


-- -----------------------------------------------------------------------------
-- planos.vendedor_id — quem ativou aquele cliente na Compra Programada.
-- Usado para creditar a comissão quando um veículo é vendido àquele cliente.
-- -----------------------------------------------------------------------------
alter table public.planos
  add column vendedor_id uuid references public.profiles (id) on delete set null;

comment on column public.planos.vendedor_id is 'Vendedor vinculado a este plano (quem ativou o cliente). Usado para calcular a comissão na venda.';


-- -----------------------------------------------------------------------------
-- comissoes
-- -----------------------------------------------------------------------------
create table public.comissoes (
  id                uuid primary key default gen_random_uuid(),
  vendedor_id       uuid not null references public.profiles (id) on delete restrict,
  plano_id          uuid not null references public.planos (id) on delete restrict,
  veiculo_id        uuid not null references public.veiculos (id) on delete restrict,
  reserva_id        uuid references public.reservas (id) on delete set null,
  percentual        numeric(6, 5) not null,
  preco_venda_centavos bigint not null,
  valor_centavos    bigint not null,
  status            text not null default 'pendente',
  criado_em         timestamptz not null default now(),
  pago_em           timestamptz,

  constraint comissoes_status_valido check (status in ('pendente', 'paga')),
  constraint comissoes_valores_coerentes check (
    percentual >= 0 and percentual <= 1
    and preco_venda_centavos > 0
    and valor_centavos >= 0
  ),
  -- Uma venda gera no máximo uma comissão.
  constraint comissoes_uma_por_veiculo_plano unique (veiculo_id, plano_id)
);

comment on table public.comissoes is 'Comissão de vendedor sobre a venda de um veículo. Gerada automaticamente ao marcar reserva como convertida/veículo como vendido.';

create index comissoes_vendedor_idx on public.comissoes (vendedor_id, criado_em desc);


-- -----------------------------------------------------------------------------
-- Helpers de autorização por permissão de cargo.
-- -----------------------------------------------------------------------------
create or replace function public.tem_permissao(p_permissao text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    -- admin e operador continuam com acesso total, independente de cargo.
    public.is_staff()
    or exists (
      select 1
      from public.profiles p
      join public.cargo_permissoes cp on cp.cargo_id = p.cargo_id
      where p.id = auth.uid()
        and p.papel = 'vendedor'
        and cp.permissao_chave = p_permissao
    )
$$;

comment on function public.tem_permissao(text) is
  'true se o usuário autenticado é staff (admin/operador) OU é vendedor com a permissão informada no seu cargo.';

-- É vendedor (independente de permissão específica)?
create or replace function public.is_vendedor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.auth_papel() = 'vendedor', false)
$$;


-- -----------------------------------------------------------------------------
-- RLS: cargos, permissoes, cargo_permissoes, comissoes.
-- -----------------------------------------------------------------------------
alter table public.cargos            enable row level security;
alter table public.permissoes        enable row level security;
alter table public.cargo_permissoes  enable row level security;
alter table public.comissoes         enable row level security;

alter table public.cargos            force row level security;
alter table public.permissoes        force row level security;
alter table public.cargo_permissoes  force row level security;
alter table public.comissoes         force row level security;

-- cargos: staff (admin/operador) gerencia; vendedor só lê (para saber o próprio).
create policy cargos_staff_tudo on public.cargos
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy cargos_vendedor_le on public.cargos
  for select to authenticated
  using (public.is_vendedor());

-- permissoes: catálogo fixo, todo autenticado pode ler (útil para a UI montar
-- a lista de toggles); só staff poderia escrever, mas escrita é por migration.
create policy permissoes_todos_leem on public.permissoes
  for select to authenticated
  using (true);

-- cargo_permissoes: staff gerencia; vendedor lê (para saber as próprias permissões).
create policy cargo_permissoes_staff_tudo on public.cargo_permissoes
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy cargo_permissoes_vendedor_le on public.cargo_permissoes
  for select to authenticated
  using (public.is_vendedor());

-- comissoes: staff vê tudo. Vendedor vê as próprias, ou todas se tiver a
-- permissão 'comissoes.ver_todas'.
create policy comissoes_staff_tudo on public.comissoes
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy comissoes_vendedor_le on public.comissoes
  for select to authenticated
  using (
    vendedor_id = auth.uid()
    or public.tem_permissao('comissoes.ver_todas')
  );
