-- =============================================================================
-- 10 — Tabelas de domínio
--
-- Convenções:
--  - Nomes de tabelas/colunas/domínio em português.
--  - Todo valor monetário: bigint em CENTAVOS, sufixo _centavos. Nunca float/numeric.
--  - Timestamps: timestamptz default now(). Datas sem hora: date.
--  - IDs: uuid default gen_random_uuid(), exceto profiles.id (FK auth.users).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMs
-- -----------------------------------------------------------------------------
create type public.papel_usuario as enum ('admin', 'operador', 'cliente');

create type public.status_plano as enum ('ativo', 'suspenso', 'concluido', 'cancelado');

create type public.tipo_aporte as enum ('aporte', 'estorno', 'taxa', 'ajuste');
create type public.status_aporte as enum ('pendente', 'confirmado', 'rejeitado');
create type public.meio_pagamento as enum ('pix', 'dinheiro', 'ted', 'cartao', 'outro');

create type public.status_veiculo as enum ('disponivel', 'reservado', 'vendido', 'inativo');

create type public.status_reserva as enum ('ativa', 'expirada', 'convertida', 'cancelada');

create type public.status_proposta as enum ('rascunho', 'aprovada', 'recusada', 'fechada');

-- Tipos de notificação. `reaberto` é o slot próprio (decisão A3) para quando um
-- veículo volta de 'reservado' para 'disponivel' — permite um re-alerta sem
-- violar o UNIQUE(cliente_id, veiculo_id, tipo) do alerta original 'novo_elegivel'.
create type public.tipo_notificacao as enum (
  'novo_elegivel',
  'preco_reduzido',
  'reaberto',
  'reserva_expirando',
  'lembrete_aporte'
);

create type public.status_notificacao as enum (
  'fila',
  'enviada',
  'entregue',
  'lida',
  'falha'
);

create type public.canal_notificacao as enum ('whatsapp');


-- -----------------------------------------------------------------------------
-- profiles — extensão de auth.users
-- -----------------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  nome_completo  text not null,
  cpf            text not null unique,
  telefone_e164  text not null,
  papel          public.papel_usuario not null default 'cliente',
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),

  constraint profiles_cpf_formato check (cpf ~ '^\d{11}$'),
  constraint profiles_telefone_e164_formato check (telefone_e164 ~ '^\+\d{10,15}$')
);

comment on table public.profiles is 'Perfil da aplicação, 1:1 com auth.users.';
comment on column public.profiles.cpf is 'Somente dígitos, 11 caracteres.';
comment on column public.profiles.telefone_e164 is 'Formato E.164, ex.: +5562999999999.';


-- -----------------------------------------------------------------------------
-- veiculos — estoque
-- (declarada antes de planos por causa da FK veiculo_alvo_id)
-- -----------------------------------------------------------------------------
create table public.veiculos (
  id                    uuid primary key default gen_random_uuid(),
  marca                 text not null,
  modelo                text not null,
  versao                text,
  ano_fabricacao        smallint not null,
  ano_modelo            smallint not null,
  km                    integer not null default 0,
  cor                   text,
  combustivel           text,
  cambio                text,
  placa                 text,               -- armazenada completa; exposta mascarada ao cliente
  chassi                text,               -- nunca exposto ao cliente
  renavam               text,               -- nunca exposto ao cliente
  preco_venda_centavos  bigint not null,
  preco_custo_centavos  bigint,             -- nunca exposto ao cliente
  status                public.status_veiculo not null default 'disponivel',
  destaque              boolean not null default false,
  criado_em             timestamptz not null default now(),
  publicado_em          timestamptz,

  constraint veiculos_preco_venda_positivo check (preco_venda_centavos > 0),
  constraint veiculos_preco_custo_positivo check (preco_custo_centavos is null or preco_custo_centavos >= 0),
  constraint veiculos_km_nao_negativo check (km >= 0),
  constraint veiculos_anos_plausiveis check (
    ano_fabricacao between 1950 and 2100
    and ano_modelo between ano_fabricacao and ano_fabricacao + 1
  )
);

comment on table public.veiculos is 'Estoque de veículos da revenda.';
comment on column public.veiculos.placa is 'Placa completa. A view vw_veiculos_publico expõe versão mascarada.';
comment on column public.veiculos.preco_custo_centavos is 'NUNCA exposto ao cliente (RLS + view).';

create index veiculos_status_idx on public.veiculos (status);
create index veiculos_marca_modelo_trgm on public.veiculos using gin ((marca || ' ' || modelo) extensions.gin_trgm_ops);


-- -----------------------------------------------------------------------------
-- planos — contrato de compra programada
-- -----------------------------------------------------------------------------
create sequence public.plano_codigo_seq;

create table public.planos (
  id                                uuid primary key default gen_random_uuid(),
  cliente_id                        uuid not null references public.profiles (id) on delete restrict,
  codigo                            text not null unique,
  status                            public.status_plano not null default 'ativo',
  percentual_minimo                 numeric(4, 3) not null default 0.500,
  aporte_mensal_previsto_centavos   bigint not null default 0,
  dia_vencimento                    smallint not null default 5,
  veiculo_alvo_id                   uuid references public.veiculos (id) on delete set null,
  data_adesao                       date not null default current_date,
  observacoes                       text,
  criado_em                         timestamptz not null default now(),

  constraint planos_percentual_minimo_faixa check (percentual_minimo > 0 and percentual_minimo <= 1),
  constraint planos_dia_vencimento_faixa check (dia_vencimento between 1 and 28),
  constraint planos_aporte_previsto_nao_negativo check (aporte_mensal_previsto_centavos >= 0)
);

comment on table public.planos is 'Contrato de compra programada de um cliente.';
comment on column public.planos.percentual_minimo is 'Fração do preço de venda exigida como saldo para elegibilidade. Padrão 0.500. Configurável por plano (diretoria pode exigir 0.600 de um cliente).';
comment on column public.planos.veiculo_alvo_id is 'Preferência do cliente. O saldo é fungível: pode ser usado em qualquer veículo elegível.';

create index planos_cliente_idx on public.planos (cliente_id);
create index planos_status_idx on public.planos (status);

-- Gera o código legível CP-<ano>-<seq 4 dígitos> no insert.
create or replace function public.gerar_codigo_plano()
returns trigger
language plpgsql
as $$
begin
  if new.codigo is null or new.codigo = '' then
    new.codigo := 'CP-'
      || to_char(coalesce(new.data_adesao, current_date), 'YYYY')
      || '-'
      || lpad(nextval('public.plano_codigo_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger planos_gerar_codigo
  before insert on public.planos
  for each row
  execute function public.gerar_codigo_plano();


-- -----------------------------------------------------------------------------
-- aportes — ledger APPEND-ONLY
--
-- Nunca UPDATE/DELETE em aporte confirmado. Correção = novo lançamento de
-- estorno com valor negativo referenciando o original (estorno_de_id).
-- O saldo é SEMPRE calculado (view vw_saldo_cliente), nunca denormalizado.
-- -----------------------------------------------------------------------------
create table public.aportes (
  id                uuid primary key default gen_random_uuid(),
  plano_id          uuid not null references public.planos (id) on delete restrict,
  valor_centavos    bigint not null,           -- pode ser negativo em estorno
  tipo              public.tipo_aporte not null default 'aporte',
  status            public.status_aporte not null default 'pendente',
  meio_pagamento    public.meio_pagamento not null default 'pix',
  data_competencia  date not null default current_date,
  comprovante_url   text,
  estorno_de_id     uuid references public.aportes (id) on delete restrict,
  confirmado_por    uuid references public.profiles (id) on delete set null,
  confirmado_em     timestamptz,
  criado_em         timestamptz not null default now(),

  -- Estorno tem valor negativo e referencia o aporte original; os demais tipos
  -- (aporte/taxa/ajuste) não referenciam e, salvo 'ajuste', são positivos.
  constraint aportes_estorno_coerente check (
    (tipo = 'estorno' and estorno_de_id is not null and valor_centavos < 0)
    or (tipo <> 'estorno' and estorno_de_id is null)
  ),
  constraint aportes_valor_nao_zero check (valor_centavos <> 0),
  constraint aportes_confirmacao_coerente check (
    (status = 'confirmado' and confirmado_em is not null)
    or (status <> 'confirmado')
  )
);

comment on table public.aportes is 'Ledger append-only de aportes. Ver trigger aportes_bloqueia_mutacao.';
comment on column public.aportes.valor_centavos is 'Centavos. Negativo apenas quando tipo = estorno.';
comment on column public.aportes.estorno_de_id is 'Aporte original que este estorno reverte.';

create index aportes_plano_idx on public.aportes (plano_id);
create index aportes_status_idx on public.aportes (status);
create unique index aportes_um_estorno_por_aporte on public.aportes (estorno_de_id) where estorno_de_id is not null;


-- -----------------------------------------------------------------------------
-- veiculo_fotos
-- -----------------------------------------------------------------------------
create table public.veiculo_fotos (
  id          uuid primary key default gen_random_uuid(),
  veiculo_id  uuid not null references public.veiculos (id) on delete cascade,
  url         text not null,
  ordem       smallint not null default 0,
  capa        boolean not null default false,
  criado_em   timestamptz not null default now()
);

create index veiculo_fotos_veiculo_idx on public.veiculo_fotos (veiculo_id, ordem);
create unique index veiculo_fotos_uma_capa on public.veiculo_fotos (veiculo_id) where capa;


-- -----------------------------------------------------------------------------
-- veiculo_precos_historico
-- -----------------------------------------------------------------------------
create table public.veiculo_precos_historico (
  id                       uuid primary key default gen_random_uuid(),
  veiculo_id               uuid not null references public.veiculos (id) on delete cascade,
  preco_anterior_centavos  bigint not null,
  preco_novo_centavos      bigint not null,
  alterado_por             uuid references public.profiles (id) on delete set null,
  alterado_em              timestamptz not null default now()
);

create index veiculo_precos_historico_veiculo_idx on public.veiculo_precos_historico (veiculo_id, alterado_em desc);


-- -----------------------------------------------------------------------------
-- reservas
-- -----------------------------------------------------------------------------
create table public.reservas (
  id          uuid primary key default gen_random_uuid(),
  plano_id    uuid not null references public.planos (id) on delete restrict,
  veiculo_id  uuid not null references public.veiculos (id) on delete restrict,
  status      public.status_reserva not null default 'ativa',
  expira_em   timestamptz not null,
  criado_em   timestamptz not null default now()
);

comment on table public.reservas is 'Reserva de veículo por um plano. Quem reserva primeiro tem prioridade. Expira em N horas (configuracoes.horas_reserva).';

create index reservas_veiculo_idx on public.reservas (veiculo_id);
create index reservas_plano_idx on public.reservas (plano_id);
-- No máximo uma reserva ativa por veículo.
create unique index reservas_uma_ativa_por_veiculo on public.reservas (veiculo_id) where status = 'ativa';
-- Índice para o cron de expiração.
create index reservas_ativas_expira_em_idx on public.reservas (expira_em) where status = 'ativa';


-- -----------------------------------------------------------------------------
-- propostas — simulação/negociação da promissória
-- -----------------------------------------------------------------------------
create table public.propostas (
  id                        uuid primary key default gen_random_uuid(),
  reserva_id                uuid not null references public.reservas (id) on delete restrict,
  preco_veiculo_centavos    bigint not null,
  entrada_centavos          bigint not null,             -- saldo aplicado
  saldo_financiado_centavos bigint not null,
  qtd_parcelas              smallint not null,
  valor_parcela_centavos    bigint not null,
  taxa_juros_mensal         numeric(6, 5) not null default 0.02000,
  status                    public.status_proposta not null default 'rascunho',
  criado_em                 timestamptz not null default now(),

  constraint propostas_valores_positivos check (
    preco_veiculo_centavos > 0
    and entrada_centavos >= 0
    and saldo_financiado_centavos >= 0
    and qtd_parcelas > 0
    and valor_parcela_centavos > 0
  ),
  constraint propostas_soma_bate check (entrada_centavos + saldo_financiado_centavos = preco_veiculo_centavos)
);

comment on table public.propostas is 'Simulação de promissória (Tabela Price). Fórmula em lib/promissoria.ts.';

create index propostas_reserva_idx on public.propostas (reserva_id);


-- -----------------------------------------------------------------------------
-- notificacoes
-- -----------------------------------------------------------------------------
create table public.notificacoes (
  id                   uuid primary key default gen_random_uuid(),
  cliente_id           uuid not null references public.profiles (id) on delete cascade,
  veiculo_id           uuid references public.veiculos (id) on delete cascade,
  tipo                 public.tipo_notificacao not null,
  canal                public.canal_notificacao not null default 'whatsapp',
  template             text not null,
  payload              jsonb not null default '{}'::jsonb,
  status               public.status_notificacao not null default 'fila',
  provider_message_id  text,
  erro                 text,
  agendado_para        timestamptz not null default now(),
  enviado_em           timestamptz,
  criado_em            timestamptz not null default now(),

  -- Deduplicação obrigatória (regra 3.5): o mesmo cliente nunca recebe duas
  -- vezes o mesmo alerta do mesmo carro.
  constraint notificacoes_dedupe unique (cliente_id, veiculo_id, tipo)
);

comment on table public.notificacoes is 'Fila e histórico de notificações. UNIQUE(cliente_id, veiculo_id, tipo) faz a dedupe.';

create index notificacoes_status_agendado_idx on public.notificacoes (status, agendado_para) where status = 'fila';
create index notificacoes_cliente_idx on public.notificacoes (cliente_id, criado_em desc);


-- -----------------------------------------------------------------------------
-- audit_log — regra 3.6
-- -----------------------------------------------------------------------------
create table public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid references public.profiles (id) on delete set null,
  acao         text not null,
  entidade     text not null,
  entidade_id  uuid,
  dados_antes  jsonb,
  dados_depois jsonb,
  ip           inet,
  criado_em    timestamptz not null default now()
);

comment on table public.audit_log is 'Trilha de auditoria de ações sensíveis: confirmar aporte, estornar, alterar preço, criar reserva, marcar como vendido.';

create index audit_log_entidade_idx on public.audit_log (entidade, entidade_id, criado_em desc);
create index audit_log_usuario_idx on public.audit_log (usuario_id, criado_em desc);


-- -----------------------------------------------------------------------------
-- configuracoes — chave/valor para parâmetros globais
-- -----------------------------------------------------------------------------
create table public.configuracoes (
  chave       text primary key,
  valor       text not null,
  descricao   text,
  atualizado_em timestamptz not null default now()
);

comment on table public.configuracoes is 'Parâmetros globais. Ver seed em 60_configuracoes.sql.';
