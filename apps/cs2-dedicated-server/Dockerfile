# Build from monorepo root:
#   docker build -f apps/cs2-dedicated-server/Dockerfile -t cs2helper/cs2-dedicated-server:local .
#
# Status HTTP sidecar: turbo prune + pnpm + vite build (bundle + dist/package.json type:module) + tsc declarations.
#
# Requires ~35GB+ free on the volume mounted at CS2_INSTALL_DIR for game files + Workshop cache.
# Linux/amd64 only. GSI cfg is written at runtime to ${CS2_INSTALL_DIR}/game/csgo/cfg (see entrypoint).
# Status: HTTP on CS2_STATUS_PORT (default 28080/tcp) when CS2_STATUS_SERVER=1 — GET /, GET /events (SSE), POST /update — publish with -p 28080:28080.
#   Optional Basic auth: set CS2_STATUS_HTTP_USER + CS2_STATUS_HTTP_PASSWORD together, or omit both (open if port is published).

FROM node:22-bookworm AS cs2-status-prune
WORKDIR /repo
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
COPY . .
RUN pnpm dlx turbo@2.6.1 prune @cs2helper/cs2-dedicated-status-http --docker

FROM node:22-bookworm AS cs2-status-http-build
WORKDIR /repo
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
COPY --from=cs2-status-prune /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=cs2-status-prune /repo/out/full/ .
# turbo prune does not ship the repo-root tsconfig extended by packages/*/tsconfig.json
COPY tsconfig.base.json ./tsconfig.base.json
RUN pnpm exec turbo run build --filter=@cs2helper/cs2-dedicated-status-http

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
# Windows CRLF checkouts break shebangs in Linux; normalize even if repo slips CRLF.
RUN sed -i 's/\r$//' /entrypoint.sh \
  /usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh \
  /usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh
COPY apps/cs2-dedicated-server/config/gsi/ ${GSI_TEMPLATE_DIR}/
COPY --from=cs2-status-http-build /repo/packages/cs2-dedicated-status-http/dist /usr/share/cs2helper/cs2-dedicated-status-http/dist

ENV CS2_INSTALL_SCRIPT=/usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh
ENV CS2_WRITE_LAUNCH_SCRIPT=/usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh
ENV CS2_CHILD_SCRIPT=/run/cs2-exec.sh

RUN chmod +x /entrypoint.sh \
  /usr/share/cs2helper/cs2-dedicated-server/install-cs2.sh \
  /usr/share/cs2helper/cs2-dedicated-server/write-cs2-exec.sh

# Game + SourceTV; status HTTP is optional (see CS2_STATUS_SERVER / CS2_STATUS_PORT).
EXPOSE 27015/tcp 27015/udp 27020/udp 28080/tcp

ENTRYPOINT ["/entrypoint.sh"]
