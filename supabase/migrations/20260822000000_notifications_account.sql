-- ============================================
-- Realtime order notifications + self-service account deletion
-- ============================================

-- ── Broadcast order inserts so the admin panel can notify live ──
-- (Events respect RLS: only admin subscribers can see order rows.)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;

-- ── Real account deletion (the old button only showed a toast) ──
-- Cascades: profiles, addresses, carts/cart_items are deleted with the
-- user; orders keep their rows with customer_id set null (business
-- records stay, now anonymized). Admin accounts cannot self-delete —
-- prevents locking the store out of /admin.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Admin accounts cannot be deleted from the storefront';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
