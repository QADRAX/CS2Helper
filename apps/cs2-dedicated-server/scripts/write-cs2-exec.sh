#!/usr/bin/env bash
# After install: resolve binary, build argv, write /run/cs2-exec.sh (used by direct exec or status server child).
set -euo pipefail

CS2_INSTALL_DIR="${CS2_INSTALL_DIR:-/opt/cs2}"
CS2_EXEC_SCRIPT="${CS2_EXEC_SCRIPT:-/run/cs2-exec.sh}"

CS2_START_MAP="${CS2_START_MAP:-de_dust2}"
CS2_PORT="${CS2_PORT:-27015}"
CS2_TV_PORT="${CS2_TV_PORT:-27020}"
CS2_MAX_PLAYERS="${CS2_MAX_PLAYERS:-10}"
CS2_GAME_TYPE="${CS2_GAME_TYPE:-0}"
CS2_GAME_MODE="${CS2_GAME_MODE:-1}"

die() {
  echo "error: $*" >&2
  exit 1
}

resolve_cs2_binary() {
  local d="$CS2_INSTALL_DIR"
  local rel
  for rel in game/bin/linuxsteamrt64/cs2 game/bin/linux_steamrt64/cs2; do
    if [[ -x "${d}/${rel}" ]]; then
      echo "${d}/${rel}"
      return 0
    fi
  done
  return 1
}

cs2_bin="$(resolve_cs2_binary)" || die "could not find cs2 dedicated binary under ${CS2_INSTALL_DIR}"

export STEAMAPPID="${STEAMAPPID:-730}"
cs2_rt_dir="$(dirname "${cs2_bin}")"
export LD_LIBRARY_PATH="${cs2_rt_dir}${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}"

launch=( "${cs2_bin}" -dedicated -console -usercon )
launch+=( +game_type "${CS2_GAME_TYPE}" +game_mode "${CS2_GAME_MODE}" )

if [[ -n "${CS2_MAPGROUP:-}" ]]; then
  launch+=( +mapgroup "${CS2_MAPGROUP}" )
else
  launch+=( +mapgroup mg_active )
fi

launch+=( +map "${CS2_START_MAP}" )
launch+=( -port "${CS2_PORT}" -tv_port "${CS2_TV_PORT}" -maxplayers_override "${CS2_MAX_PLAYERS}" )

if [[ -n "${CS2_HOSTNAME:-}" ]]; then
  launch+=( +hostname "${CS2_HOSTNAME}" )
fi

# RCON: requires -usercon (set above). Clients use the game port (CS2_PORT) for RCON when enabled.
if [[ -n "${CS2_RCON_PASSWORD:-}" ]]; then
  launch+=( +rcon_password "${CS2_RCON_PASSWORD}" )
elif [[ -n "${CS2_RCONPW:-}" ]]; then
  launch+=( +rcon_password "${CS2_RCONPW}" )
fi

if [[ -n "${SRCDS_TOKEN:-}" ]]; then
  launch+=( +sv_setsteamaccount "${SRCDS_TOKEN}" )
else
  echo "warning: SRCDS_TOKEN unset — LAN/local only; public listing needs a GSLT." >&2
fi

if [[ -n "${CS2_STEAM_AUTH_KEY:-}" ]]; then
  launch+=( -authkey "${CS2_STEAM_AUTH_KEY}" )
fi

if [[ -n "${CS2_HOST_WORKSHOP_MAP:-}" ]]; then
  launch+=( +host_workshop_map "${CS2_HOST_WORKSHOP_MAP}" )
fi

if [[ -n "${CS2_HOST_WORKSHOP_COLLECTION:-}" ]]; then
  launch+=( +host_workshop_collection "${CS2_HOST_WORKSHOP_COLLECTION}" )
fi

if [[ -n "${CS2_EXTRA_ARGS:-}" ]]; then
  # shellcheck disable=SC2206
  read -r -a extra <<< "${CS2_EXTRA_ARGS}"
  launch+=( "${extra[@]}" )
fi

{
  echo '#!/usr/bin/env bash'
  echo 'set -euo pipefail'
  echo "export STEAMAPPID=$(printf '%q' "${STEAMAPPID}")"
  echo "export LD_LIBRARY_PATH=$(printf '%q' "${LD_LIBRARY_PATH}")"
  echo "cd $(printf '%q' "${CS2_INSTALL_DIR}")"
  printf 'exec '
  printf '%q ' "${launch[@]}"
  echo
} >"${CS2_EXEC_SCRIPT}.tmp"
mv "${CS2_EXEC_SCRIPT}.tmp" "${CS2_EXEC_SCRIPT}"
chmod +x "${CS2_EXEC_SCRIPT}"
echo "wrote ${CS2_EXEC_SCRIPT}"
