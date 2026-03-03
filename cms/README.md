# AbhishekPanda CMS (Strapi v5)

This folder contains the Strapi-based CMS engine used by the admin studio (`/admin/cms`).

## What is implemented
- Content types: `BlogPost`, `Course`, `InterviewPack`, `Tag`, `InterviewCategory`, `InterviewQuestion`
- Dynamic zone blocks for rich editing:
  - `richText`, `codeBlock`, `mermaidDiagram`, `callout`, `imageBlock`, `embed`, `tabs`, `steps`, `checklist`
- Custom Strapi admin fields:
  - `MermaidEditor` (Monaco + live Mermaid preview)
  - `CodeEditor` (Monaco + language picker + Shiki preview)
  - `EmbedPicker` (provider detect + live embed preview)
- Publish lint hook:
  - For `BlogPost.level` = `lead`/`architect`, publishing requires at least one `mermaidDiagram` and one `checklist`
- Rebuild hook:
  - On publish/update, `BUILD_HOOK_URL` is called (if set)

## Environment
Copy `.env.example` to `.env` and set values.

Local default (SQLite):
- `DATABASE_CLIENT=sqlite`
- `DATABASE_FILENAME=.tmp/data.db`

Production (Supabase Postgres):
- `DATABASE_CLIENT=postgres`
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `DATABASE_SSL=true`
- `DATABASE_SSL_REJECT_UNAUTHORIZED=false`

Media uploads (Supabase Storage via S3-compatible API):
- Install provider: `@strapi/provider-upload-aws-s3` (already included in this workspace).
- Set `UPLOAD_PROVIDER=aws-s3`.
- Set `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET`, `AWS_REGION`, `AWS_BUCKET`, `AWS_ENDPOINT`.
- For Supabase, set `AWS_FORCE_PATH_STYLE=true`.
- For public media URLs, set:
  - `UPLOAD_BASE_URL=https://<project-ref>.supabase.co/storage/v1/object/public/<bucket-name>`
  - `UPLOAD_ROOT_PATH=`

## Run
From repo root:
```bash
npm run dev
```

Or CMS only:
```bash
npm run dev:cms
```

Strapi URLs:
- Admin: `http://localhost:1337/cms-admin`
- API: `http://localhost:1337/cms-api`
