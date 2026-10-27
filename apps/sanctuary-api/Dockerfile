# Sanctuary API: frozen pnpm installation with the existing Bun runtime.
FROM docker.io/oven/bun:1.4.4 AS base
WORKDIR /app

FROM docker.io/library/node:24.22.1-bookworm-slim AS dependencies
WORKDIR /app
ENV CI=true
ENV HUSKY=0
RUN corepack enable
COPY . .
RUN node -e "const fs = require('node:fs'); if (process.versions.node !== fs.readFileSync('.nvmrc', 'utf8').trim()) throw new Error('Container Node version differs from .nvmrc')"
RUN pnpm --filter @repo/sanctuary-api... install --frozen-lockfile

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/sanctuary-api ./apps/sanctuary-api
COPY --from=dependencies /app/packages ./packages
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health/live || exit 1
WORKDIR /app/apps/sanctuary-api
CMD ["bun", "src/index.ts"]
