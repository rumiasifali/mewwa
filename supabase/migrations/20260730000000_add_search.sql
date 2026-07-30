-- ============================================
-- Full-text search infrastructure
-- ============================================

-- Enable trigram extension for fuzzy matching / recommendations
create extension if not exists pg_trgm;

-- ============================================
-- search_site(query text, result_limit int)
--
-- Searches across all public-facing entities.
-- Returns a unified result set with type, title,
-- subtitle, slug, image, and relevance rank.
--
-- To add a new searchable entity in the future:
--   1. Add a new CTE block (like products_results)
--   2. UNION ALL it into combined_results
--   That's it.
-- ============================================
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
as $$
declare
  search_query tsquery;
  raw_query text;
begin
  raw_query := trim(query);

  -- Return empty if no query
  if raw_query = '' then
    return;
  end if;

  -- Build tsquery: split words and join with &
  search_query := plainto_tsquery('english', raw_query);

  return query
  with combined_results as (
    -- ── Products ──
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
        to_tsvector('english', coalesce(p.name, '')) ||
        to_tsvector('english', coalesce(p.origin, '')) ||
        to_tsvector('english', coalesce(p.description, '')) ||
        to_tsvector('english', coalesce(array_to_string(p.tags, ' '), ''))
      ) @@ search_query
      or lower(p.name) like '%' || lower(raw_query) || '%'
      or lower(p.origin) like '%' || lower(raw_query) || '%'
      or lower(p.description) like '%' || lower(raw_query) || '%'

    union all

    -- ── Categories ──
    select
      'category'::text as result_type,
      c.id,
      c.name as title,
      coalesce(c.description, '') as subtitle,
      c.slug,
      c.image_url,
      '/products?category=' || c.slug as url,
      (
        ts_rank(
          setweight(to_tsvector('english', coalesce(c.name, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(c.description, '')), 'B'),
          search_query
        )
        + case when lower(c.name) like '%' || lower(raw_query) || '%' then 0.6 else 0 end
      )::real as rank
    from categories c
    where
      (
        to_tsvector('english', coalesce(c.name, '')) ||
        to_tsvector('english', coalesce(c.description, ''))
      ) @@ search_query
      or lower(c.name) like '%' || lower(raw_query) || '%'
      or lower(c.description) like '%' || lower(raw_query) || '%'

    union all

    -- ── Blog Posts ──
    select
      'post'::text as result_type,
      po.id,
      po.title as title,
      coalesce(po.excerpt, '') as subtitle,
      po.slug,
      po.cover_image as image_url,
      '/blog/' || po.slug as url,
      (
        ts_rank(
          setweight(to_tsvector('english', coalesce(po.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(po.excerpt, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(po.content, '')), 'D'),
          search_query
        )
        + case when lower(po.title) like '%' || lower(raw_query) || '%' then 0.5 else 0 end
      )::real as rank
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
  order by rank desc
  limit result_limit;
end;
$$;

-- ============================================
-- search_recommendations(query text, limit int)
--
-- When search_site returns no results, call this
-- to get smart suggestions. Uses trigram similarity
-- for fuzzy matching + popular/featured items.
-- ============================================
create or replace function search_recommendations(
  query text,
  result_limit int default 8
)
returns table (
  result_type text,
  id uuid,
  title text,
  subtitle text,
  slug text,
  image_url text,
  url text,
  similarity_score real
)
language plpgsql
stable
as $$
declare
  raw_query text;
begin
  raw_query := lower(trim(query));

  if raw_query = '' then
    -- No query: return featured products
    return query
    select
      'product'::text,
      p.id,
      p.name,
      coalesce(p.origin, ''),
      p.slug,
      p.image_url,
      '/products/' || p.slug,
      1.0::real
    from products p
    where p.is_available = true and p.is_featured = true
    order by p.sort_order
    limit result_limit;
    return;
  end if;

  return query
  with fuzzy_products as (
    select
      'product'::text as result_type,
      p.id,
      p.name as title,
      coalesce(p.origin, '') as subtitle,
      p.slug,
      p.image_url,
      '/products/' || p.slug as url,
      greatest(
        similarity(lower(p.name), raw_query),
        similarity(lower(coalesce(p.origin, '')), raw_query),
        similarity(lower(coalesce(p.description, '')), raw_query)
      ) as similarity_score
    from products p
    where p.is_available = true
  ),
  fuzzy_categories as (
    select
      'category'::text as result_type,
      c.id,
      c.name as title,
      coalesce(c.description, '') as subtitle,
      c.slug,
      c.image_url,
      '/products?category=' || c.slug as url,
      greatest(
        similarity(lower(c.name), raw_query),
        similarity(lower(coalesce(c.description, '')), raw_query)
      ) as similarity_score
    from categories c
  ),
  fuzzy_posts as (
    select
      'post'::text as result_type,
      po.id,
      po.title as title,
      coalesce(po.excerpt, '') as subtitle,
      po.slug,
      po.cover_image as image_url,
      '/blog/' || po.slug as url,
      greatest(
        similarity(lower(po.title), raw_query),
        similarity(lower(coalesce(po.excerpt, '')), raw_query)
      ) as similarity_score
    from posts po
    where po.published = true
  ),
  all_fuzzy as (
    select * from fuzzy_products
    union all
    select * from fuzzy_categories
    union all
    select * from fuzzy_posts
  )
  select * from all_fuzzy
  where similarity_score > 0.05
  order by similarity_score desc
  limit result_limit;
end;
$$;
