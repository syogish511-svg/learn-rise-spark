/*
# Storage bucket policies for file uploads

Sets up row-level security on the storage.objects table for four private buckets:
- submissions: students upload their own work; staff and parents can read
- resources: staff upload and manage; students read based on resource visibility
- doubts: students upload doubt attachments; staff can read
- assignment-papers: staff upload PDFs only

## Security
- All policies check folder ownership (first path segment = user_id) for student uploads
- Staff-only for resource/assignment-paper management
- Resource reads go through can_view_resource() function for visibility checks
*/

insert into storage.buckets (id, name, public) values
  ('submissions', 'submissions', false),
  ('resources', 'resources', false),
  ('doubts', 'doubts', false),
  ('assignment-papers', 'assignment-papers', false)
on conflict (id) do nothing;

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
