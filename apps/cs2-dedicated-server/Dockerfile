# Build from monorepo root:
#   docker build -f apps/cs2-dedicated-server/Dockerfile -t cs2helper/cs2-dedicated-server:local .
#
# Requires ~35GB+ free on the volume mounted at CS2_INSTALL_DIR for game files + Workshop cache.
# Linux/amd64 only. GSI cfg is written at runtime to ${CS2_INSTALL_DIR}/game/csgo/cfg (see entrypoint).
# Status: HTTP on CS2_STATUS_PORT (default 28080/tcp) when CS2_STATUS_SERVER=1 — publish with -p 28080:28080.
#   Requires CS2_STATUS_HTTP_USER + CS2_STATUS_HTTP_PASSWORD (Basic auth on all endpoints).

FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN echo steam steam/question select "I AGREE" | debconf-set-selections \
  && echo steam steam/license note '' | debconf-set-selections

RUN dpkg --add-architecture i386 \
  && apt-get update -y \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    locales \
    steamcmd \
  && rm -rf /var/lib/apt/lists/*

RUN locale-gen en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en

RUN ln -sf /usr/games/steamcmd /usr/bin/steamcmd \
  && steamcmd +quit

ARG NODE_VERSION=22.12.0
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends curl xz-utils \
  && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o /tmp/node.tar.xz \
  && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
  && rm -rf /tmp/node.tar.xz \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.steam \
  && ln -sf /root/.local/share/Steam/steamcmd/linux32 /root/.steam/sdk32 \
  && ln -sf /root/.local/share/Steam/steamcmd/linux64 /root/.steam/sdk64 \
  && ln -sf /root/.steam/sdk32/steamclient.so /root/.steam/sdk32/steamservice.so \
  && ln -sf /root/.steam/sdk64/steamclient.so /root/.steam/sdk64/steamservice.so

ARG CS2_INSTALL_DIR=/opt/cs2
ENV CS2_INSTALL_DIR=${CS2_INSTALL_DIR}
ENV GSI_TEMPLATE_DIR=/usr/share/cs2helper/gsi
ENV GSI_DROPIN_DIR=/etc/cs2helper/gsi-dropin
ENV GSI_CFG_MODE=copy-once
ENV CS2_STATUS_SERVER=1
ENV CS2_STATUS_PORT=28080

RUN mkdir -p "${CS2_INSTALL_DIR}"

WORKDIR ${CS2_INSTALL_DIR}

COPY apps/cs2-dedicated-server/scripts/entrypoint.sh /entrypoint.sh
COPY apps/cs2-dedicated-server/scripts/install-cs2.sh /usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh
COPY apps/cs2-dedicated-server/scripts/write-cs2-exec.sh /usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh
COPY apps/cs2-dedicated-server/config/gsi/ ${GSI_TEMPLATE_DIR}/
COPY packages/cs2-dedicated-status-http/server.mjs /usr/share/cs2helper/cs2-dedicated-status-http/server.mjs

ENV CS2_INSTALL_SCRIPT=/usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh
ENV CS2_WRITE_LAUNCH_SCRIPT=/usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh
ENV CS2_CHILD_SCRIPT=/run/cs2-exec.sh

RUN chmod +x /entrypoint.sh \
  /usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh \
  /usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh

# Game + SourceTV; status HTTP is optional (see CS2_STATUS_SERVER / CS2_STATUS_PORT).
EXPOSE 27015/tcp 27015/udp 27020/udp 28080/tcp

ENTRYPOINT ["/entrypoint.sh"]
