begin;

alter table public.spalatorie
  add column if not exists data_returnare date;

drop policy if exists "spalatorie: actualizare admin" on public.spalatorie;
drop policy if exists "spalatorie: actualizare" on public.spalatorie;

create policy "spalatorie: actualizare"
on public.spalatorie
for update
to authenticated
using ((select public.can_edit_register()))
with check ((select public.can_edit_register()));

commit;
