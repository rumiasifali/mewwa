-- ============================================
-- Schema fixes: missing columns, search bugs, order integrity
-- ============================================

-- ── 1. Columns the admin UI already edits but that never existed ──
-- (Product and settings saves were failing silently with PGRST204.)
alter table products
  add column if not exists grade text,
  add column if not exists storage_instructions text,
  add column if not exists shelf_life text,
  add column if not exists shipping_info text,
  add column if not exists lab_report_url text,
  add column if not exists is_lab_tested boolean default false,
  add column if not exists stock numeric;

alter table site_settings
  add column if not exists flat_rate numeric default 0,
  add column if not exists free_shipping_threshold numeric,
  add column if not exists announcement_text text;

-- Replace the seeded placeholder WhatsApp number with the real one.
-- (The storefront reads this value; constants.ts is only a fallback.)
update site_settings
  set whatsapp_number = '923427059590'
  where whatsapp_number = '923001234567' or whatsapp_number is null;

-- ── 2. Search: operator precedence leaked unavailable products ──
-- The old WHERE parsed as (available AND tsmatch) OR like-clauses,
-- so the LIKE branches ignored is_available. Also adds the missing
-- indexes (previously every search was a sequential scan).
create index if not exists idx_products_search
  on products using gin (
    (
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(origin, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'C')
    )
  );
create index if not exists idx_products_name_trgm on products using gin (lower(name) gin_trgm_ops);
create index if not exists idx_posts_search
  on posts using gin (
    (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
    )
  );

create or replace function search_site(
  query text,
  result_limit int default 20
)
returns table (
  result_type text,
  id uuid,
  title text,
  subtitle text,
  slug text,
  image_url text,
  url text,
  rank real
)
language plpgsql
stable
set search_path = public
as $$
declare
  search_query tsquery;
  raw_query text;
begin
  raw_query := trim(query);
  if raw_query = '' then
    return;
  end if;
  search_query := plainto_tsquery('english', raw_query);

  return query
  with combined_results as (
    select
      'product'::text as result_type,
      p.id,
      p.name as title,
      coalesce(p.origin, '') as subtitle,
      p.slug,
      p.image_url,
      '/products/' || p.slug as url,
      (
        ts_rank(
          setweight(to_tsvector('english', coalesce(p.name, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(p.origin, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(p.description, '')), 'C') ||
          setweight(to_tsvector('english', coalesce(array_to_string(p.tags, ' '), '')), 'B'),
          search_query
        )
        + case when lower(p.name) like '%' || lower(raw_query) || '%' then 0.5 else 0 end
      )::real as rank
    from products p
    where p.is_available = true
      and (
        (
          to_tsvector('english', coalesce(p.name, '')) ||
          to_tsvector('english', coalesce(p.origin, '')) ||
          to_tsvector('english', coalesce(p.description, '')) ||
          to_tsvector('english', coalesce(array_to_string(p.tags, ' '), ''))
        ) @@ search_query
        or lower(p.name) like '%' || lower(raw_query) || '%'
        or lower(p.origin) like '%' || lower(raw_query) || '%'
        or lower(p.description) like '%' || lower(raw_query) || '%'
      )

    union all

    select
      'category'::text,
      c.id,
      c.name,
      coalesce(c.description, ''),
      c.slug,
      c.image_url,
      '/products?category=' || c.slug,
      (
        ts_rank(
          setweight(to_tsvector('english', coalesce(c.name, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(c.description, '')), 'B'),
          search_query
        )
        + case when lower(c.name) like '%' || lower(raw_query) || '%' then 0.6 else 0 end
      )::real
    from categories c
    where
      (
        to_tsvector('english', coalesce(c.name, '')) ||
        to_tsvector('english', coalesce(c.description, ''))
      ) @@ search_query
      or lower(c.name) like '%' || lower(raw_query) || '%'
      or lower(c.description) like '%' || lower(raw_query) || '%'

    union all

    select
      'post'::text,
      po.id,
      po.title,
      coalesce(po.excerpt, ''),
      po.slug,
      po.cover_image,
      '/blog/' || po.slug,
      (
        ts_rank(
          setweight(to_tsvector('english', coalesce(po.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(po.excerpt, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(po.content, '')), 'D'),
          search_query
        )
        + case when lower(po.title) like '%' || lower(raw_query) || '%' then 0.5 else 0 end
      )::real
    from posts po
    where po.published = true
      and (
        (
          to_tsvector('english', coalesce(po.title, '')) ||
          to_tsvector('english', coalesce(po.excerpt, '')) ||
          to_tsvector('english', coalesce(po.content, ''))
        ) @@ search_query
        or lower(po.title) like '%' || lower(raw_query) || '%'
        or lower(po.excerpt) like '%' || lower(raw_query) || '%'
      )
  )
  select * from combined_results
  order by combined_results.rank desc
  limit result_limit;
end;
$$;

-- ── 2b. Contact messages (the contact form previously discarded input) ──
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  ip_address text,
  created_at timestamptz default now()
);

alter table contact_messages enable row level security;

create policy "Anyone can send contact messages"
  on contact_messages for insert
  with check (true);

create policy "Admins can read contact messages"
  on contact_messages for select
  using (public.is_admin());

-- ── 3. Testimonials: public insert may only create pending rows ──
drop policy if exists "Anyone can create testimonials" on testimonials;
create policy "Anyone can create pending testimonials"
  on testimonials for insert
  with check (status = 'pending');

-- ── 4. Harden security-definer functions (mutable search_path) ──
alter function public.get_or_create_cart() set search_path = public;
alter function public.handle_new_user() set search_path = public;

-- ── 5. place_order_from_cart: derive prices from the catalog ──
-- Previously subtotal summed cart_items.price, which the client
-- supplied. Prices/labels now come from products.weights at order
-- time; carts containing unknown weights or unavailable products are
-- rejected. Delivery fee comes from site_settings.
create or replace function place_order_from_cart(
  p_customer_name text,
  p_customer_phone text default null,
  p_city text default null,
  p_address_snapshot jsonb default null,
  p_channel text default 'whatsapp',
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_cart_id uuid;
  v_order_id uuid;
  v_ref text;
  v_subtotal numeric;
  v_delivery numeric := 0;
  v_total numeric;
  v_item_count int;
  v_summary text;
  v_email text;
  v_flat_rate numeric;
  v_free_threshold numeric;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('error', 'Not authenticated');
  end if;

  if p_customer_name is null or trim(p_customer_name) = '' then
    return jsonb_build_object('error', 'Customer name is required');
  end if;
  if p_channel not in ('whatsapp', 'gateway') then
    return jsonb_build_object('error', 'Invalid channel');
  end if;

  select email into v_email from auth.users where id = v_user_id;

  select id into v_cart_id from carts where user_id = v_user_id;
  if v_cart_id is null then
    return jsonb_build_object('error', 'Cart not found');
  end if;

  select count(*) into v_item_count from cart_items where cart_id = v_cart_id;
  if v_item_count = 0 then
    return jsonb_build_object('error', 'Cart is empty');
  end if;

  -- Reject carts referencing unavailable products or weights that are
  -- no longer in the catalog.
  if exists (
    select 1
    from cart_items ci
    join products p on p.id = ci.product_id
    left join lateral (
      select (elem->>'price')::numeric as price
      from jsonb_array_elements(p.weights) elem
      where (elem->>'grams')::int = ci.weight_grams
      limit 1
    ) w on true
    where ci.cart_id = v_cart_id
      and (p.is_available = false or w.price is null)
  ) then
    return jsonb_build_object('error', 'Cart contains items that are no longer available. Please review your cart.');
  end if;

  -- Subtotal from catalog prices, not cart rows.
  select coalesce(sum(w.price * ci.quantity), 0),
         string_agg(p.name || ' ' || w.label || ' x' || ci.quantity, ', ')
    into v_subtotal, v_summary
  from cart_items ci
  join products p on p.id = ci.product_id
  cross join lateral (
    select (elem->>'price')::numeric as price, elem->>'label' as label
    from jsonb_array_elements(p.weights) elem
    where (elem->>'grams')::int = ci.weight_grams
    limit 1
  ) w
  where ci.cart_id = v_cart_id;

  -- Delivery fee from settings (0 when unset or over free threshold).
  select flat_rate, free_shipping_threshold
    into v_flat_rate, v_free_threshold
  from site_settings limit 1;
  if v_flat_rate is not null and v_flat_rate > 0
     and (v_free_threshold is null or v_subtotal < v_free_threshold) then
    v_delivery := v_flat_rate;
  end if;
  v_total := v_subtotal + v_delivery;

  v_ref := 'QA-' || nextval('order_ref_seq');

  insert into orders (
    ref, customer_id, customer_name, customer_email, customer_phone,
    city, address_snapshot, items_summary, item_count,
    subtotal, delivery_fee, total, channel, notes
  ) values (
    v_ref, v_user_id, trim(p_customer_name), v_email, p_customer_phone,
    p_city, p_address_snapshot, v_summary, v_item_count,
    v_subtotal, v_delivery, v_total, p_channel, p_notes
  ) returning id into v_order_id;

  insert into order_items (
    order_id, product_id, product_name, product_slug, image_url, origin,
    weight_grams, weight_label, price, currency, quantity, line_total
  )
  select
    v_order_id, ci.product_id, p.name, p.slug, p.image_url, p.origin,
    ci.weight_grams, w.label, w.price, coalesce(w.currency, 'PKR'),
    ci.quantity, (w.price * ci.quantity)
  from cart_items ci
  join products p on p.id = ci.product_id
  cross join lateral (
    select (elem->>'price')::numeric as price,
           elem->>'label' as label,
           elem->>'currency' as currency
    from jsonb_array_elements(p.weights) elem
    where (elem->>'grams')::int = ci.weight_grams
    limit 1
  ) w
  where ci.cart_id = v_cart_id;

  -- Decrement tracked stock (stock is in kg; null = untracked product)
  update products p
  set stock = greatest(p.stock - s.kg, 0)
  from (
    select ci.product_id, sum(ci.weight_grams * ci.quantity) / 1000.0 as kg
    from cart_items ci
    where ci.cart_id = v_cart_id
    group by ci.product_id
  ) s
  where p.id = s.product_id and p.stock is not null;

  delete from cart_items where cart_id = v_cart_id;

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'ref', v_ref,
    'total', v_total,
    'item_count', v_item_count
  );
end;
$$;
