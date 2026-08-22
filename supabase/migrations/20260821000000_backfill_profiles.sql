-- ============================================
-- Backfill profiles for pre-existing accounts
-- ============================================
-- The profiles table + on-signup trigger arrived in 20260730000001,
-- but accounts created before that date never got a profiles row.
-- After the security hardening (admin checks read profiles.role),
-- those accounts were locked out of /admin. Backfill every auth user
-- missing a profile, then grant admin to the owner accounts.

insert into profiles (id, full_name, wa_updates)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
  coalesce((u.raw_user_meta_data->>'wa_updates')::boolean, false)
from auth.users u
left join profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- Owner/admin accounts. Add future admins the same way, or update
-- profiles.role directly in the dashboard.
update profiles set role = 'admin'
where id in (
  select id from auth.users
  where email in ('rumiasifali@gmail.com', 'rumiasif77@gmail.com')
);
