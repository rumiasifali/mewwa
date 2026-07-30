-- ============================================
-- Server-side cart: carts + cart_items
-- ============================================

-- One active cart per user
create table carts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger carts_updated_at
  before update on carts
  for each row execute function update_updated_at();

create index idx_carts_user on carts(user_id);

-- Cart items: product + weight combo is unique per cart
create table cart_items (
  id uuid default gen_random_uuid() primary key,
  cart_id uuid references carts(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  weight_grams int not null,
  weight_label text not null,
  price numeric not null,
  currency text default 'PKR',
  quantity int default 1 check (quantity >= 1 and quantity <= 10),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(cart_id, product_id, weight_grams)
);

create trigger cart_items_updated_at
  before update on cart_items
  for each row execute function update_updated_at();

create index idx_cart_items_cart on cart_items(cart_id);

-- ── RLS: users can only access their own cart ──

alter table carts enable row level security;

create policy "Users can read own cart"
  on carts for select
  using (user_id = auth.uid());

create policy "Users can insert own cart"
  on carts for insert
  with check (user_id = auth.uid());

create policy "Users can update own cart"
  on carts for update
  using (user_id = auth.uid());

create policy "Users can delete own cart"
  on carts for delete
  using (user_id = auth.uid());

alter table cart_items enable row level security;

create policy "Users can read own cart items"
  on cart_items for select
  using (
    cart_id in (select id from carts where user_id = auth.uid())
  );

create policy "Users can insert own cart items"
  on cart_items for insert
  with check (
    cart_id in (select id from carts where user_id = auth.uid())
  );

create policy "Users can update own cart items"
  on cart_items for update
  using (
    cart_id in (select id from carts where user_id = auth.uid())
  );

create policy "Users can delete own cart items"
  on cart_items for delete
  using (
    cart_id in (select id from carts where user_id = auth.uid())
  );

-- ── Helper: get or create cart for current user ──
create or replace function get_or_create_cart()
returns uuid
language plpgsql
security definer
as $$
declare
  cart_uuid uuid;
begin
  select id into cart_uuid from carts where user_id = auth.uid();
  if cart_uuid is null then
    insert into carts (user_id) values (auth.uid()) returning id into cart_uuid;
  end if;
  return cart_uuid;
end;
$$;
