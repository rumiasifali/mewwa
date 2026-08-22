-- ============================================
-- Security hardening: admin-only writes, PII lockdown
-- ============================================
-- Before this migration, every "authenticated" user (any Google login)
-- could read all orders/customers, write products/posts/settings, and
-- moderate testimonials. Policies below restrict those to profiles
-- with role = 'admin'.
--
-- IMPORTANT: make sure your own account is an admin before/right after
-- applying, or you will lose access to /admin until you run the
-- promotion statement at the bottom in the SQL editor.

-- ── Admin check (security definer avoids RLS recursion on profiles) ──
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ── Profiles: fix infinitely-recursive admin policy ──
-- The old policy queried profiles from within a profiles policy,
-- which raises "infinite recursion detected in policy" (42P17).
drop policy if exists "Admins can read all profiles" on profiles;
create policy "Admins can read all profiles"
  on profiles for select
  using (public.is_admin());

-- ── Products: writes + read-all restricted to admins ──
drop policy if exists "Authenticated can read all products" on products;
drop policy if exists "Authenticated can insert products" on products;
drop policy if exists "Authenticated can update products" on products;
drop policy if exists "Authenticated can delete products" on products;
create policy "Admins can read all products" on products for select using (public.is_admin());
create policy "Admins can insert products" on products for insert with check (public.is_admin());
create policy "Admins can update products" on products for update using (public.is_admin());
create policy "Admins can delete products" on products for delete using (public.is_admin());

-- ── Categories ──
drop policy if exists "Authenticated can select categories" on categories;
drop policy if exists "Authenticated can insert categories" on categories;
drop policy if exists "Authenticated can update categories" on categories;
drop policy if exists "Authenticated can delete categories" on categories;
create policy "Admins can insert categories" on categories for insert with check (public.is_admin());
create policy "Admins can update categories" on categories for update using (public.is_admin());
create policy "Admins can delete categories" on categories for delete using (public.is_admin());

-- ── Posts ──
drop policy if exists "Authenticated can read all posts" on posts;
drop policy if exists "Authenticated can insert posts" on posts;
drop policy if exists "Authenticated can update posts" on posts;
drop policy if exists "Authenticated can delete posts" on posts;
create policy "Admins can read all posts" on posts for select using (public.is_admin());
create policy "Admins can insert posts" on posts for insert with check (public.is_admin());
create policy "Admins can update posts" on posts for update using (public.is_admin());
create policy "Admins can delete posts" on posts for delete using (public.is_admin());

-- ── Site settings ──
drop policy if exists "Authenticated can insert settings" on site_settings;
drop policy if exists "Authenticated can update settings" on site_settings;
drop policy if exists "Authenticated can delete settings" on site_settings;
create policy "Admins can insert settings" on site_settings for insert with check (public.is_admin());
create policy "Admins can update settings" on site_settings for update using (public.is_admin());
create policy "Admins can delete settings" on site_settings for delete using (public.is_admin());

-- ── Orders: customers keep read-own; everything else admin-only ──
-- (Order creation happens through the security-definer RPC, so no
-- customer insert policy is needed.)
drop policy if exists "Authenticated can read all orders" on orders;
drop policy if exists "Authenticated can insert orders" on orders;
drop policy if exists "Authenticated can update orders" on orders;
create policy "Admins can read all orders" on orders for select using (public.is_admin());
create policy "Admins can insert orders" on orders for insert with check (public.is_admin());
create policy "Admins can update orders" on orders for update using (public.is_admin());
create policy "Admins can delete orders" on orders for delete using (public.is_admin());

drop policy if exists "Authenticated can read all order items" on order_items;
drop policy if exists "Authenticated can insert order items" on order_items;
create policy "Admins can read all order items" on order_items for select using (public.is_admin());
create policy "Admins can insert order items" on order_items for insert with check (public.is_admin());

-- ── Testimonials: moderation is admin-only; pending rows (with emails)
--    are no longer readable by arbitrary logged-in users ──
drop policy if exists "Authenticated users can view all testimonials" on testimonials;
drop policy if exists "Authenticated users can update testimonials" on testimonials;
drop policy if exists "Authenticated users can delete testimonials" on testimonials;
create policy "Admins can view all testimonials" on testimonials for select using (public.is_admin());
create policy "Admins can update testimonials" on testimonials for update using (public.is_admin());
create policy "Admins can delete testimonials" on testimonials for delete using (public.is_admin());

-- ── Testimonial submissions: USING(true) exposed every submitter's
--    email + IP to anonymous clients ──
drop policy if exists "Anyone can read own submissions by ip" on testimonial_submissions;
drop policy if exists "Authenticated users can read submissions" on testimonial_submissions;
create policy "Admins can read submissions" on testimonial_submissions for select using (public.is_admin());

-- ── Storage: product image writes admin-only ──
-- (Wrapped: on some Supabase stacks storage.objects policies are owned
-- by supabase_storage_admin and must be changed from the dashboard.)
do $$
begin
  drop policy if exists "Authenticated can upload product images" on storage.objects;
  drop policy if exists "Authenticated can update product images" on storage.objects;
  drop policy if exists "Authenticated can delete product images" on storage.objects;
  create policy "Admins can upload product images"
    on storage.objects for insert
    with check (bucket_id = 'product-images' and public.is_admin());
  create policy "Admins can update product images"
    on storage.objects for update
    using (bucket_id = 'product-images' and public.is_admin());
  create policy "Admins can delete product images"
    on storage.objects for delete
    using (bucket_id = 'product-images' and public.is_admin());
exception when insufficient_privilege then
  raise notice 'Could not alter storage.objects policies — update them in the Supabase dashboard instead.';
end $$;

-- ── Admin roles ──
-- Admin accounts are managed manually:
--   update profiles set role = 'admin' where id in
--     (select id from auth.users where email in ('<admin-email>', ...));
-- Make sure every admin profile has role = 'admin' when applying this,
-- or those accounts lose /admin access until promoted.
