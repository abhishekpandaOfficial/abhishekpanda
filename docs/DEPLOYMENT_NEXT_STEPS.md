# Next Steps: Verify Locally, Then Deploy (Supabase + Vercel)

## 1) Supabase Auth Redirect URLs (Required)
In Supabase Dashboard:
- Auth -> URL Configuration -> Redirect URLs
  - `http://localhost:8080/login`
  - `https://www.abhishekpanda.com/login`

This is required for magic-link login (`/login`).

## 2) Create Your Admin User (One-Time)
Go to `http://localhost:8080/admin/login` and use the “first-time setup” flow (calls the `admin-setup` edge function).

Then confirm in DB:
- `public.user_roles` has a row with your `user_id` and `role = 'admin'`.

## 3) Create a Blog Post (So Blog + Prerender Have Content)
In the Admin UI:
- `Admin -> Blog`
- Create post -> Publish

Verify:
- `public.blog_posts` has the row.
- `public.blog_posts_public_cache` has the matching row (trigger backfill/sync).

## 4) Verify Hard Paywall
- Create one post as free (`is_premium=false`) and one as premium (`is_premium=true`).
- Confirm:
  - Anonymous can read free post.
  - Anonymous cannot read premium post (paywall).
  - Add entitlement row:
    - table: `public.user_entitlements`
    - `user_id = <your auth uid>`
    - `entitlement = 'blog_premium'`
    - `expires_at = NULL`
  - After login, you can read premium post.

## 5) Verify Build Output (SEO)
Run:
- `npm run build`

Expect:
- `dist/sitemap.xml`
- `dist/rss.xml`
- `dist/blog/index.html`
- `dist/blog/<slug>/index.html` for each published post

## 6) GitHub Actions + Vercel
Workflows are in:
- `.github/workflows/supabase-deploy.yml`

Vercel deployment:
- Recommended: use the Vercel Dashboard Git integration (no GitHub Action needed).

Add required GitHub secrets:
- Supabase:
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_PROJECT_REF` (e.g. `qayywyddbprlhkqcqllf`)
If you also want GitHub Actions to keep Edge Function secrets in sync, add them to GitHub secrets too.
