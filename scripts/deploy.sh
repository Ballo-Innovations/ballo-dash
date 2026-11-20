#!/usr/bin/env bash
# Deploy the web app to a Vercel environment (team ballo-innovations) from a
# PUSHED ref, after the full check suite.
#
#   scripts/deploy.sh dev                        # origin/dev   -> ballo-dash-dev
#   scripts/deploy.sh staging                    # origin/main  -> ballo-dash-staging
#   scripts/deploy.sh staging feat/some-branch   # a pushed branch, for review
#   DRY_RUN=1 scripts/deploy.sh dev ...          # checks only
#
# Never deploys your working tree: it checks out the exact pushed commit into a
# temporary worktree, runs lint, types, unit tests, the production build and the
# dependency audit there, then deploys that same directory.
# The live project (ballo-dash, team balloinnovations-projects) is NOT touched.
set -euo pipefail

ENVIRONMENT="${1:-}"
SCOPE="ballo-innovations"
case "$ENVIRONMENT" in
  dev)     PROJECT="ballo-dash-dev";     DEFAULT_REF="dev";  API_ORIGIN_ENV="https://api-dash-dev.169-58-121-60.sslip.io" ;;
  staging) PROJECT="ballo-dash-staging"; DEFAULT_REF="main"; API_ORIGIN_ENV="https://api-dash-staging.169-58-121-60.sslip.io" ;;
  *) echo "usage: scripts/deploy.sh dev|staging [pushed-branch]" >&2; exit 2 ;;
esac
REF="${2:-$DEFAULT_REF}"

repo="$(git rev-parse --show-toplevel)"
cd "$repo"
git fetch --quiet origin "$REF"
commit="$(git rev-parse "origin/$REF")"
echo "Deploying origin/$REF ($commit) to $PROJECT"

work="$(mktemp -d "${TMPDIR:-/tmp}/ballo-dash-deploy.XXXX")"
cleanup() { git -C "$repo" worktree remove --force "$work" >/dev/null 2>&1 || rm -rf "$work"; }
trap cleanup EXIT
git worktree add --quiet --detach "$work" "$commit"
cd "$work"

echo "checks: install"
npm ci --no-audit --no-fund --loglevel=error
echo "checks: lint";       npm run --silent lint >/dev/null
echo "checks: types";      npm run --silent typecheck
echo "checks: unit tests"; npx vitest run --reporter=dot | tail -3
echo "checks: build";      API_ORIGIN="$API_ORIGIN_ENV" npx next build >/dev/null
echo "checks: audit";      npm audit --omit=dev --audit-level=high
echo "checks: PASSED for $commit"

if [ -n "${DRY_RUN:-}" ]; then echo "DRY_RUN: not deploying"; exit 0; fi

# Link the temporary checkout to the staging project and deploy it.
vercel link --yes --project "$PROJECT" --scope "$SCOPE" >/dev/null
url="$(vercel deploy --prod --yes --scope "$SCOPE" --meta gitCommitSha="$commit" --meta gitRef="$REF" 2>/dev/null | grep -Eo 'https://[^ ]+\.vercel\.app' | head -1)"
echo "deployed: $url"

echo "verifying https://$PROJECT.vercel.app"
status="$(curl -s -o /dev/null -m 30 -w '%{http_code}' "https://$PROJECT.vercel.app/login" || true)"
health="$(curl -s -m 30 "https://$PROJECT.vercel.app/api/health" || true)"
echo "  /login -> $status"
echo "  /api/health -> $health"
if [ "$status" != "200" ]; then
  echo "WARNING: could not confirm /login from this machine (local network?). Check the URL in a browser." >&2
fi
