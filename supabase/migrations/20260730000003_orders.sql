-- ============================================
-- Orders system
-- ============================================

create table orders (
  id uuid default gen_random_uuid() primary key,
  ref text not null unique, -- e.g. QA-1001
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  city text,
  address_snapshot jsonb, -- copy of address at order time
  items_summary text, -- "Almonds 500g x2, Walnuts 1kg x1"
  item_count int default 0,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  total numeric not null default 0,
  currency text default 'PKR',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  channel text not null default 'whatsapp'
    check (channel in ('whatsapp', 'gateway')),
  whatsapp_thread_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

create index idx_orders_customer on orders(customer_id);
create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);

create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_slug text,
  image_url text,
  origin text,
  weight_grams int not null,
  weight_label text not null,
  price numeric not null,
  currency text default 'PKR',
  quantity int not null default 1,
  line_total numeric not null,
  created_at timestamptz default now()
);

create index idx_order_items_order on order_items(order_id);

-- RLS: customers can read own orders, admins can read/write all
alter table orders enable row level security;

create policy "Customers can read own orders"
  on orders for select
  using (customer_id = auth.uid());

create policy "Authenticated can read all orders"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can insert orders"
  on orders for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated can update orders"
  on orders for update
  using (auth.role() = 'authenticated');

alter table order_items enable row level security;

create policy "Customers can read own order items"
  on order_items for select
  using (
    order_id in (select id from orders where customer_id = auth.uid())
  );

create policy "Authenticated can read all order items"
  on order_items for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can insert order items"
  on order_items for insert
  with check (auth.role() = 'authenticated');

-- ── Sequence for order refs ──
create sequence order_ref_seq start 1001;

-- ── Function: place order from cart ──
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
as $$
declare
  v_user_id uuid;
  v_cart_id uuid;
  v_order_id uuid;
  v_ref text;
  v_subtotal numeric;
  v_item_count int;
  v_summary text;
  v_email text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('error', 'Not authenticated');
  end if;

  -- Get user email
  select email into v_email from auth.users where id = v_user_id;

  -- Get cart
  select id into v_cart_id from carts where user_id = v_user_id;
  if v_cart_id is null then
    return jsonb_build_object('error', 'Cart not found');
  end if;

  -- Check cart has items
  select count(*) into v_item_count from cart_items where cart_id = v_cart_id;
  if v_item_count = 0 then
    return jsonb_build_object('error', 'Cart is empty');
  end if;

  -- Generate ref
  v_ref := 'QA-' || nextval('order_ref_seq');

  -- Calculate subtotal
  select coalesce(sum(price * quantity), 0) into v_subtotal
  from cart_items where cart_id = v_cart_id;

  -- Build summary
  select string_agg(
    p.name || ' ' || ci.weight_label || ' x' || ci.quantity,
    ', '
  ) into v_summary
  from cart_items ci
  join products p on p.id = ci.product_id
  where ci.cart_id = v_cart_id;

  -- Create order
  insert into orders (
    ref, customer_id, customer_name, customer_email, customer_phone,
    city, address_snapshot, items_summary, item_count,
    subtotal, total, channel, notes
  ) values (
    v_ref, v_user_id, p_customer_name, v_email, p_customer_phone,
    p_city, p_address_snapshot, v_summary, v_item_count,
    v_subtotal, v_subtotal, p_channel, p_notes
  ) returning id into v_order_id;

  -- Copy cart items to order items
  insert into order_items (
    order_id, product_id, product_name, product_slug, image_url, origin,
    weight_grams, weight_label, price, currency, quantity, line_total
  )
  select
    v_order_id, ci.product_id, p.name, p.slug, p.image_url, p.origin,
    ci.weight_grams, ci.weight_label, ci.price, ci.currency,
    ci.quantity, (ci.price * ci.quantity)
  from cart_items ci
  join products p on p.id = ci.product_id
  where ci.cart_id = v_cart_id;

  -- Clear cart
  delete from cart_items where cart_id = v_cart_id;

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'ref', v_ref,
    'total', v_subtotal,
    'item_count', v_item_count
  );
end;
$$;
