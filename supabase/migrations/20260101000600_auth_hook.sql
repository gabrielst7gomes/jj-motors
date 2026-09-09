-- =============================================================================
-- 35 — Sincronização auth.users -> profiles
--
-- Quando um usuário é criado no Auth, materializamos um profile básico a partir
-- do raw_user_meta_data. O papel default é 'cliente'; o script de seed / admin
-- promove para 'admin'/'operador' quando necessário.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome_completo, cpf, telefone_e164, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', 'Sem nome'),
    -- Fallback determinístico e sempre com 11 dígitos: últimos 11 dígitos do
    -- hash do uuid. Colisão é improvável e, se ocorrer, o unique(cpf) barra e o
    -- cadastro deve informar o CPF real via raw_user_meta_data.
    coalesce(
      new.raw_user_meta_data ->> 'cpf',
      lpad((('x' || substr(md5(new.id::text), 1, 15))::bit(60)::bigint % 100000000000)::text, 11, '0')
    ),
    coalesce(new.raw_user_meta_data ->> 'telefone_e164', '+550000000000'),
    coalesce((new.raw_user_meta_data ->> 'papel')::public.papel_usuario, 'cliente')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
