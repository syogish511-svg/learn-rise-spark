
create policy "submissions own upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "submissions read" on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff(auth.uid())
    or public.is_parent_of(auth.uid(), ((storage.foldername(name))[1])::uuid)));
create policy "resources staff upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'resources' and public.is_staff(auth.uid()));
create policy "resources staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'resources' and public.is_staff(auth.uid()));
create policy "resources read" on storage.objects for select to authenticated
  using (bucket_id = 'resources' and (public.is_staff(auth.uid()) or exists (
    select 1 from public.resources r where r.file_path = storage.objects.name and public.can_view_resource(auth.uid(), r.id))));
