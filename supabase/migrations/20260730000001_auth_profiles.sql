-- ============================================
-- Customer auth: profiles + addresses
-- ============================================

-- Profiles table (auto-created on signup via trigger)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  wa_updates boolean default false,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Updated_at trigger
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- RLS
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Users can insert own profile"
  on profiles for insert
  with check (id = auth.uid());

create policy "Admins can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, wa_updates)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce((new.raw_user_meta_data->>'wa_updates')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- Addresses
-- ============================================
create table addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text default 'Home',
  recipient text,
  line1 text,
  line2 text,
  city text,
  postal_code text,
  phone text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger addresses_updated_at
  before update on addresses
  for each row execute function update_updated_at();

-- Partial unique index: only one default per user
create unique index idx_addresses_one_default
  on addresses (user_id)
  where is_default = true;

create index idx_addresses_user on addresses(user_id);

-- RLS
alter table addresses enable row level security;

create policy "Users can read own addresses"
  on addresses for select
  using (user_id = auth.uid());

create policy "Users can insert own addresses"
  on addresses for insert
  with check (user_id = auth.uid());

create policy "Users can update own addresses"
  on addresses for update
  using (user_id = auth.uid());

create policy "Users can delete own addresses"
  on addresses for delete
  using (user_id = auth.uid());
