#!/usr/bin/env bash
# Deploy the web app to the Vercel staging project (ballo-dash-staging,
# team ballo-innovations) from a PUSHED ref, after the full check suite.
#
#   scripts/deploy-staging.sh                       # origin/main
#   scripts/deploy-staging.sh feat/platform-split   # a pushed branch, for review
#   DRY_RUN=1 scripts/deploy-staging.sh ...          # checks only
#
# Never deploys your working tree: it checks out the exact pushed commit into a
# temporary worktree, runs lint, types, unit tests, the production build and the
# dependency audit there, then deploys that same directory.
# The live project (ballo-dash, team balloinnovations-projects) is NOT touched.
set -euo pipefail

REF="${1:-main}"
SCOPE="ballo-innovations"
PROJECT="ballo-dash-staging"
API_ORIGIN_STAGING="https://api-dash-staging.169-58-121-60.sslip.io"

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
echo "checks: build";      API_ORIGIN="$API_ORIGIN_STAGING" npx next build >/dev/null
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
