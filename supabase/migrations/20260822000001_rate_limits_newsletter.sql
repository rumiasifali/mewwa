-- ============================================
-- Atomic rate limiting + newsletter signups
-- ============================================

-- ── Durable, atomic rate limiter ──
-- The old pattern counted rows then inserted (TOCTOU: N concurrent
-- requests all passed), and the API-route limiter was in-memory per
-- serverless instance. This claims atomically under a row lock.
create table if not exists rate_limit_counters (
  key text primary key,
  window_start timestamptz not null default now(),
  count int not null default 1
);

alter table rate_limit_counters enable row level security;
-- No policies: only accessible through the security-definer function.

create or replace function public.claim_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row rate_limit_counters%rowtype;
begin
  insert into rate_limit_counters as c (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set window_start = case
          when c.window_start < now() - make_interval(secs => p_window_seconds)
          then now() else c.window_start end,
        count = case
          when c.window_start < now() - make_interval(secs => p_window_seconds)
          then 1 else c.count + 1 end
  returning * into v_row;

  return v_row.count <= p_max;
end;
$$;

revoke all on function public.claim_rate_limit(text, int, int) from public;
grant execute on function public.claim_rate_limit(text, int, int) to authenticated, anon;

-- Opportunistic cleanup of stale counters (called by the function's
-- consumers is overkill; a periodic delete keeps the table tiny)
create or replace function public.cleanup_rate_limits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from rate_limit_counters where window_start < now() - interval '1 day';
$$;

-- ── Newsletter signups (the blog form previously did nothing) ──
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now()
);

alter table newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

create policy "Admins can read subscribers"
  on newsletter_subscribers for select
  using (public.is_admin());
