#!/usr/bin/env bash
# SteamCMD app_update 730 + GSI cfg materialization. Used by entrypoint (no status HTTP) and by the status server.
#
# CS2_STEAMCMD_VALIDATE (default 1): if 1/true/yes, runs "app_update 730 validate" (full checksum pass, slow on ~66GB).
# Set to 0/false/no for "app_update 730" only — faster restarts; still applies patches when Valve ships updates.
set -euo pipefail

CS2_INSTALL_DIR="${CS2_INSTALL_DIR:-/opt/cs2}"
GSI_TEMPLATE_DIR="${GSI_TEMPLATE_DIR:-/usr/share/cs2helper/gsi}"
GSI_DROPIN_DIR="${GSI_DROPIN_DIR:-/etc/cs2helper/gsi-dropin}"
GSI_CFG_MODE="${GSI_CFG_MODE:-copy-once}"
GSI_URI="${GSI_URI:-http://127.0.0.1:3000}"
STEAMCMD_BIN="${STEAMCMD_BIN:-steamcmd}"
_validate_flag="${CS2_STEAMCMD_VALIDATE:-1}"

die() {
  echo "error: $*" >&2
  exit 1
}

materialize_gsi_cfgs() {
  local cfg_dir="${CS2_INSTALL_DIR}/game/csgo/cfg"
  mkdir -p "${cfg_dir}"

  local dest="gamestate_integration_cs2helper.cfg"
  local dest_path="${cfg_dir}/${dest}"
  local template="${GSI_TEMPLATE_DIR}/${dest}"

  [[ -f "${template}" ]] || die "missing GSI template: ${template}"

  local should_write=1
  if [[ "${GSI_CFG_MODE}" == "copy-once" && -f "${dest_path}" ]]; then
    should_write=0
  fi

  if [[ "${should_write}" -eq 1 ]]; then
    sed "s#__GSI_URI__#${GSI_URI}#g" "${template}" >"${dest_path}.tmp"
    mv "${dest_path}.tmp" "${dest_path}"
    echo "wrote GSI cfg: ${dest_path}"
  else
    echo "skip GSI template (copy-once, exists): ${dest_path}"
  fi

  if [[ -d "${GSI_DROPIN_DIR}" ]]; then
    shopt -s nullglob
    local drop
    for drop in "${GSI_DROPIN_DIR}"/*.cfg; do
      cp -f "${drop}" "${cfg_dir}/"
      echo "applied GSI drop-in: $(basename "${drop}")"
    done
    shopt -u nullglob
  fi
}

steamcmd_args=(
  +force_install_dir "${CS2_INSTALL_DIR}"
  +login anonymous
  +app_update 730
)
case "${_validate_flag,,}" in
  0 | false | no | off) echo "steamcmd: updating CS2 (AppID 730) without validate (CS2_STEAMCMD_VALIDATE=${_validate_flag}) ..." ;;
  *) steamcmd_args+=(validate); echo "steamcmd: updating CS2 dedicated (AppID 730) with validate into ${CS2_INSTALL_DIR} ..." ;;
esac
steamcmd_args+=(+quit)

"${STEAMCMD_BIN}" "${steamcmd_args[@]}"

materialize_gsi_cfgs
