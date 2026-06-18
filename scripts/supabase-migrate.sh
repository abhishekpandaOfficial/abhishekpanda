#!/usr/bin/env bash

set -euo pipefail

ACTION="${1:-status}"
MIGRATION_NAME="${2:-}"
PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
PROJECTS_JSON=""

if [[ -z "${PROJECT_REF}" && -f "supabase/config.toml" ]]; then
  PROJECT_REF="$(sed -n 's/^project_id = "\(.*\)"/\1/p' supabase/config.toml | head -n1)"
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is not installed. Install it first:"
  echo "  brew install supabase/tap/supabase"
  exit 1
fi

load_projects() {
  set +e
  PROJECTS_JSON="$(supabase projects list -o json 2>/dev/null)"
  local EXIT_CODE=$?
  set -e
  if [[ ${EXIT_CODE} -ne 0 || -z "${PROJECTS_JSON}" || "${PROJECTS_JSON}" == "[]" ]]; then
    echo "Supabase auth check failed."
    echo "Run:"
    echo "  supabase login"
    exit 1
  fi
}

ensure_project_ref() {
  load_projects

  if [[ -z "${PROJECT_REF}" ]]; then
    PROJECT_REF="$(node -e "const p=JSON.parse(process.argv[1]);const linked=p.find(x=>x.linked);process.stdout.write((linked?.ref||p[0]?.ref||''));" "${PROJECTS_JSON}")"
  fi

  if [[ -z "${PROJECT_REF}" ]]; then
    echo "No Supabase project found for this account."
    exit 1
  fi

  local FOUND
  FOUND="$(node -e "const p=JSON.parse(process.argv[1]);const ref=process.argv[2];process.stdout.write(p.some(x=>x.ref===ref)?'yes':'no');" "${PROJECTS_JSON}" "${PROJECT_REF}")"
  if [[ "${FOUND}" != "yes" ]]; then
    echo "Configured project ref '${PROJECT_REF}' is not accessible by current Supabase account."
    echo "Run:"
    echo "  supabase projects list"
    echo "  supabase link --project-ref <your-project-ref>"
    exit 1
  fi
}

print_linked_context() {
  ensure_project_ref
  node -e "const p=JSON.parse(process.argv[1]);const ref=process.argv[2];const pr=p.find(x=>x.ref===ref);if(!pr){process.exit(0)};console.log('Supabase account authenticated.');console.log('Linked project: '+pr.name+' ('+pr.ref+')');console.log('Region: '+(pr.region||'n/a')+' | Status: '+(pr.status||'n/a')+' | Linked: '+(pr.linked?'yes':'no'));" "${PROJECTS_JSON}" "${PROJECT_REF}"
}

print_header() {
  echo
  echo "== $1 =="
}

show_status() {
  print_linked_context
  print_header "Local vs Remote Migration Status"
  supabase migration list --linked || true

  print_header "Pending Migration Check (dry-run)"
  set +e
  DRY_RUN_OUTPUT="$(supabase db push --linked --dry-run 2>&1)"
  DRY_RUN_EXIT=$?
  set -e
  echo "${DRY_RUN_OUTPUT}"

  if [[ ${DRY_RUN_EXIT} -ne 0 ]]; then
    echo
    echo "Dry-run reported an issue. Fix it before applying migrations."
    exit ${DRY_RUN_EXIT}
  fi
}

apply_migrations() {
  print_linked_context
  show_status

  echo
  read -r -p "Apply pending migrations to linked Supabase project now? (y/N): " CONFIRM
  if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi

  print_header "Applying Migrations"
  supabase db push --linked

  print_header "Regenerating Supabase Types"
  supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
  echo "Updated: src/integrations/supabase/types.ts"

  print_header "Done"
  echo "Migrations applied and types regenerated."
}

new_migration() {
  if [[ -z "${MIGRATION_NAME}" ]]; then
    echo "Missing migration name."
    echo "Usage:"
    echo "  bash scripts/supabase-migrate.sh new add_blog_feature"
    exit 1
  fi
  supabase migration new "${MIGRATION_NAME}"
}

case "${ACTION}" in
  status)
    show_status
    ;;
  push|apply)
    apply_migrations
    ;;
  new)
    new_migration
    ;;
  types)
    print_linked_context
    supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
    echo "Updated: src/integrations/supabase/types.ts"
    ;;
  *)
    echo "Unknown action: ${ACTION}"
    echo "Usage:"
    echo "  bash scripts/supabase-migrate.sh status"
    echo "  bash scripts/supabase-migrate.sh new <migration_name>"
    echo "  bash scripts/supabase-migrate.sh push"
    echo "  bash scripts/supabase-migrate.sh types"
    exit 1
    ;;
esac
