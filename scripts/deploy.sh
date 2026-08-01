#!/usr/bin/env bash
set -euo pipefail

# Old Karuizawa · Mikasa — static (SSG) deploy via rsync over SSH to Xserver.
#
# Builds the Astro site and syncs dist/ to the Apache/PHP server's docroot.
# Required env vars (set them in .env.deploy, which is gitignored):
#   DEPLOY_HOST   - server hostname or IP
#   DEPLOY_USER   - SSH user
#   DEPLOY_PATH   - absolute path to the Apache docroot on the server
# Optional:
#   DEPLOY_SSH_PORT - default 22
#   DEPLOY_DELETE    - "true" to remove remote files no longer in dist/.
#                       Off by default: only enable once you've confirmed
#                       the docroot doesn't hold anything else you need,
#                       since this permanently deletes files on the server.
#   BASE_PATH        - Astro's `base`, e.g. /staging if DEPLOY_PATH points at
#                       a subfolder. Leave unset (or "/") when DEPLOY_PATH is
#                       the actual docroot, e.g. a production promotion.
#   AUTH_USER_FILE   - absolute SERVER path to a .htpasswd file. When set AND
#                       this is a subpath (staging) build, HTTP Basic Auth is
#                       appended to the deployed .htaccess. Never applied to a
#                       root (production) deploy — see the guard below.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.deploy"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: "${DEPLOY_HOST:?Set DEPLOY_HOST in .env.deploy}"
: "${DEPLOY_USER:?Set DEPLOY_USER in .env.deploy}"
: "${DEPLOY_PATH:?Set DEPLOY_PATH in .env.deploy}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
DEPLOY_DELETE="${DEPLOY_DELETE:-false}"

echo "Building static site... (BASE_PATH=${BASE_PATH:-/})"
(cd "$ROOT_DIR" && npm run build)

# --- Staging-only HTTP Basic Auth -------------------------------------------
# Injected into the built .htaccess rather than committed to public/.htaccess,
# because that file deploys to whatever DEPLOY_PATH points at — baking auth in
# would lock the PRODUCTION site on promotion. Guarded on a non-root BASE_PATH
# so a production deploy can never pick it up.
EFFECTIVE_BASE="${BASE_PATH:-/}"
if [ "$EFFECTIVE_BASE" != "/" ] && [ -n "${AUTH_USER_FILE:-}" ]; then
  echo "Adding Basic Auth to the staging .htaccess (AuthUserFile=${AUTH_USER_FILE})"
  cat >> "$ROOT_DIR/dist/.htaccess" <<EOF

# --- Staging access restriction (injected by scripts/deploy.sh) ---
AuthType Basic
AuthName "Old Karuizawa Mikasa - Staging"
AuthUserFile ${AUTH_USER_FILE}
Require valid-user
EOF
elif [ "$EFFECTIVE_BASE" != "/" ]; then
  echo "WARNING: staging build with no AUTH_USER_FILE set — site will be PUBLIC."
fi

RSYNC_FLAGS=(-avz --progress -e "ssh -p ${DEPLOY_SSH_PORT}")
if [ "$DEPLOY_DELETE" = "true" ]; then
  RSYNC_FLAGS+=(--delete)
  echo "NOTE: DEPLOY_DELETE=true — remote files not present in dist/ will be removed."
fi

echo "Deploying dist/ to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH} ..."
rsync "${RSYNC_FLAGS[@]}" "$ROOT_DIR/dist/" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "Deploy complete."
