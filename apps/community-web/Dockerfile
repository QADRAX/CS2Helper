# Build from monorepo root:
#   docker build -f apps/community-web/Dockerfile .
#
# Requires prior lockfile; installs all workspace deps then builds shared → auth → app.

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /repo
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/community-web ./apps/community-web
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @cs2helper/shared build
RUN pnpm --filter @cs2helper/auth build
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @cs2helper/community-web run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /repo/apps/community-web/public ./apps/community-web/public
COPY --from=builder --chown=nextjs:nodejs /repo/apps/community-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/community-web/.next/static ./apps/community-web/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/community-web/server.js"]
