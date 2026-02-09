-- Blog hard paywall + public cache + view counter + blog assets bucket
-- Date: 2026-02-09

-- ============================================================================
-- 1) Entitlements
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  source TEXT NULL,
  source_ref TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, entitlement)
);

CREATE INDEX IF NOT EXISTS idx_user_entitlements_user_entitlement
  ON public.user_entitlements(user_id, entitlement);

ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own entitlements" ON public.user_entitlements;
CREATE POLICY "Users can view their own entitlements"
  ON public.user_entitlements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all entitlements" ON public.user_entitlements;
CREATE POLICY "Admins can manage all entitlements"
  ON public.user_entitlements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.has_entitlement(_user_id UUID, _entitlement TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_entitlements ue
    WHERE ue.user_id = _user_id
      AND ue.entitlement = _entitlement
      AND (ue.expires_at IS NULL OR ue.expires_at > now())
  )
$$;

-- ============================================================================
-- 2) Public cache table for blog metadata (safe for anonymous listing + SEO)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blog_posts_public_cache (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  hero_image TEXT,
  tags TEXT[],
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  word_count INTEGER NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts_public_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published blog cache rows" ON public.blog_posts_public_cache;
CREATE POLICY "Anyone can view published blog cache rows"
  ON public.blog_posts_public_cache FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage blog cache" ON public.blog_posts_public_cache;
CREATE POLICY "Admins can manage blog cache"
  ON public.blog_posts_public_cache FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.sync_blog_posts_public_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wc INTEGER;
  rt INTEGER;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM public.blog_posts_public_cache WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  -- Estimate word count without persisting content in the cache table.
  wc := CASE
    WHEN btrim(COALESCE(NEW.content, '')) = '' THEN 0
    ELSE COALESCE(array_length(regexp_split_to_array(btrim(NEW.content), '\\s+'), 1), 0)
  END;
  rt := CEIL(wc / 200.0);

  INSERT INTO public.blog_posts_public_cache (
    id, title, slug, excerpt, hero_image, tags,
    is_premium, is_published, published_at,
    meta_title, meta_description,
    word_count, reading_time_minutes,
    created_at, updated_at
  )
  VALUES (
    NEW.id, NEW.title, NEW.slug, NEW.excerpt, NEW.hero_image, NEW.tags,
    COALESCE(NEW.is_premium, false), COALESCE(NEW.is_published, false), NEW.published_at,
    NEW.meta_title, NEW.meta_description,
    wc, rt,
    NEW.created_at, NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    excerpt = EXCLUDED.excerpt,
    hero_image = EXCLUDED.hero_image,
    tags = EXCLUDED.tags,
    is_premium = EXCLUDED.is_premium,
    is_published = EXCLUDED.is_published,
    published_at = EXCLUDED.published_at,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    word_count = EXCLUDED.word_count,
    reading_time_minutes = EXCLUDED.reading_time_minutes,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_blog_posts_public_cache ON public.blog_posts;
CREATE TRIGGER trg_sync_blog_posts_public_cache
AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.sync_blog_posts_public_cache();

-- Backfill cache for existing rows without modifying blog_posts.
INSERT INTO public.blog_posts_public_cache (
  id, title, slug, excerpt, hero_image, tags,
  is_premium, is_published, published_at,
  meta_title, meta_description,
  word_count, reading_time_minutes,
  created_at, updated_at
)
SELECT
  bp.id,
  bp.title,
  bp.slug,
  bp.excerpt,
  bp.hero_image,
  bp.tags,
  COALESCE(bp.is_premium, false) AS is_premium,
  COALESCE(bp.is_published, false) AS is_published,
  bp.published_at,
  bp.meta_title,
  bp.meta_description,
  CASE
    WHEN btrim(COALESCE(bp.content, '')) = '' THEN 0
    ELSE COALESCE(array_length(regexp_split_to_array(btrim(bp.content), '\\s+'), 1), 0)
  END AS word_count,
  CEIL(
    CASE
      WHEN btrim(COALESCE(bp.content, '')) = '' THEN 0
      ELSE COALESCE(array_length(regexp_split_to_array(btrim(bp.content), '\\s+'), 1), 0)
    END / 200.0
  )::INT AS reading_time_minutes,
  bp.created_at,
  bp.updated_at
FROM public.blog_posts bp
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  excerpt = EXCLUDED.excerpt,
  hero_image = EXCLUDED.hero_image,
  tags = EXCLUDED.tags,
  is_premium = EXCLUDED.is_premium,
  is_published = EXCLUDED.is_published,
  published_at = EXCLUDED.published_at,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  word_count = EXCLUDED.word_count,
  reading_time_minutes = EXCLUDED.reading_time_minutes,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- 3) blog_posts RLS hard paywall
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Anyone can view published free posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published free posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = true AND COALESCE(is_premium, false) = false);

DROP POLICY IF EXISTS "Entitled users can view published premium posts" ON public.blog_posts;
CREATE POLICY "Entitled users can view published premium posts"
  ON public.blog_posts FOR SELECT
  USING (
    is_published = true
    AND COALESCE(is_premium, false) = true
    AND auth.uid() IS NOT NULL
    AND public.has_entitlement(auth.uid(), 'blog_premium')
  );

-- ============================================================================
-- 4) View counter RPC (respects paywall)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_blog_post_view(_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts
  SET views = COALESCE(views, 0) + 1,
      updated_at = now()
  WHERE slug = _slug
    AND is_published = true
    AND (
      COALESCE(is_premium, false) = false
      OR (
        auth.uid() IS NOT NULL
        AND (
          public.has_entitlement(auth.uid(), 'blog_premium')
          OR public.has_role(auth.uid(), 'admin')
        )
      )
    );
END;
$$;

-- ============================================================================
-- 5) Storage bucket for blog assets (+ policies)
-- ============================================================================

-- Create bucket (id + name). "public" means objects can be served without signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-assets', 'blog-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects scoped to this bucket.
DROP POLICY IF EXISTS "Public read blog-assets" ON storage.objects;
CREATE POLICY "Public read blog-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-assets');

DROP POLICY IF EXISTS "Admins can insert blog-assets" ON storage.objects;
CREATE POLICY "Admins can insert blog-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-assets' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update blog-assets" ON storage.objects;
CREATE POLICY "Admins can update blog-assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-assets' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete blog-assets" ON storage.objects;
CREATE POLICY "Admins can delete blog-assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-assets' AND public.has_role(auth.uid(), 'admin'));
