-- =============================================================================
-- 70 — Storage: buckets + políticas
--
-- Buckets:
--   comprovantes   (privado) — comprovantes de aporte. Só staff e o cliente dono.
--   veiculo-fotos  (público) — fotos do estoque. Leitura pública; escrita só staff.
--
-- Em ambiente local os buckets também são declarados em config.toml; o insert
-- abaixo é idempotente e cobre projetos remotos.
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('comprovantes', 'comprovantes', false),
  ('veiculo-fotos', 'veiculo-fotos', true)
on conflict (id) do nothing;


-- -----------------------------------------------------------------------------
-- veiculo-fotos: leitura pública, escrita/edição/remoção só staff.
-- -----------------------------------------------------------------------------
create policy "veiculo_fotos_leitura_publica" on storage.objects
  for select
  using (bucket_id = 'veiculo-fotos');

create policy "veiculo_fotos_escrita_staff" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'veiculo-fotos' and public.is_staff());

create policy "veiculo_fotos_update_staff" on storage.objects
  for update to authenticated
  using (bucket_id = 'veiculo-fotos' and public.is_staff())
  with check (bucket_id = 'veiculo-fotos' and public.is_staff());

create policy "veiculo_fotos_delete_staff" on storage.objects
  for delete to authenticated
  using (bucket_id = 'veiculo-fotos' and public.is_staff());


-- -----------------------------------------------------------------------------
-- comprovantes: privado.
--   - Staff: tudo.
--   - Cliente: lê apenas arquivos sob o prefixo do seu próprio id
--     (convenção de path: comprovantes/<cliente_id>/<arquivo>).
--   - Escrita de cliente NÃO é permitida nesta fase (upload é feito pelo
--     operador ao lançar o aporte, via route handler com service_role).
-- -----------------------------------------------------------------------------
create policy "comprovantes_staff_tudo" on storage.objects
  for all to authenticated
  using (bucket_id = 'comprovantes' and public.is_staff())
  with check (bucket_id = 'comprovantes' and public.is_staff());

create policy "comprovantes_cliente_le_os_seus" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'comprovantes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
