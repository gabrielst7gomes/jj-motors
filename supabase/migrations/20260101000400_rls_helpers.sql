-- =============================================================================
-- 30a — Helpers de RLS
-- =============================================================================

-- Papel do usuário autenticado (lê profiles). SECURITY DEFINER para não entrar
-- em recursão de política ao consultar a própria tabela profiles.
create or replace function public.auth_papel()
returns public.papel_usuario
language sql
stable
security definer
set search_path = public
as $$
  select p.papel
  from public.profiles p
  where p.id = auth.uid()
$$;

comment on function public.auth_papel() is 'Papel (admin|operador|cliente) do usuário autenticado.';

-- É staff (admin ou operador)? Decisão A5: os dois têm acesso total nesta fase.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.auth_papel() in ('admin', 'operador'), false)
$$;

comment on function public.is_staff() is 'true se o usuário autenticado é admin ou operador.';

-- Um plano pertence ao usuário autenticado?
create or replace function public.plano_e_meu(p_plano_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.planos pl
    where pl.id = p_plano_id and pl.cliente_id = auth.uid()
  )
$$;
