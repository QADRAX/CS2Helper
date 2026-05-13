#!/usr/bin/env bash
# Counter-Strike 2 dedicated server container entrypoint.
#
# Without status HTTP (CS2_STATUS_SERVER=0): install (steamcmd + GSI), write launch script, exec CS2.
# With status HTTP (default): Node orchestrates install + game and exposes /status, /update (see server.mjs).
#
# Required for public Internet: SRCDS_TOKEN (GSLT) — https://steamcommunity.com/dev/managegameservers
# Name / RCON: CS2_HOSTNAME (+hostname), CS2_RCON_PASSWORD (+rcon_password; alias CS2_RCONPW).
# GSI: GSI_URI, etc. Workshop: CS2_HOST_WORKSHOP_MAP / CS2_HOST_WORKSHOP_COLLECTION.
#
# Status HTTP auth (required when CS2_STATUS_SERVER=1): CS2_STATUS_HTTP_USER, CS2_STATUS_HTTP_PASSWORD
# Port: CS2_STATUS_PORT (default 28080). Publish: -p 28080:28080

set -euo pipefail

CS2_INSTALL_DIR="${CS2_INSTALL_DIR:-/opt/cs2}"
INSTALL_SCRIPT="${CS2_INSTALL_SCRIPT:-/usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh}"
WRITE_SCRIPT="${CS2_WRITE_LAUNCH_SCRIPT:-/usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh}"
STATUS_SCRIPT="/usr/share/cs2helper/cs2-dedicated-status-http/server.mjs"

die() {
  echo "error: $*" >&2
  exit 1
}

[[ -f "${INSTALL_SCRIPT}" ]] || die "missing ${INSTALL_SCRIPT}"
[[ -f "${WRITE_SCRIPT}" ]] || die "missing ${WRITE_SCRIPT}"

export CS2_GAME_PORT="${CS2_PORT:-27015}"

if [[ "${CS2_STATUS_SERVER:-1}" == "1" || "${CS2_STATUS_SERVER}" == "true" ]]; then
  [[ -n "${CS2_STATUS_HTTP_USER:-}" && -n "${CS2_STATUS_HTTP_PASSWORD:-}" ]] ||
    die "CS2_STATUS_HTTP_USER and CS2_STATUS_HTTP_PASSWORD are required when CS2_STATUS_SERVER is enabled."
  [[ -f "${STATUS_SCRIPT}" ]] || die "missing ${STATUS_SCRIPT}"
  exec node "${STATUS_SCRIPT}"
fi

echo "CS2_STATUS_SERVER disabled — running install then dedicated process as PID 1."
/bin/bash "${INSTALL_SCRIPT}"
/bin/bash "${WRITE_SCRIPT}"
exec "${CS2_CHILD_SCRIPT:-/run/cs2-exec.sh}"
