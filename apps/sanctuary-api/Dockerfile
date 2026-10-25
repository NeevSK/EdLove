# ==============================================================================
# Sovereign Dockerfile: Sanctuary API (Bun 1.4.4 + Hono v5 RC + oRPC v2 Beta)
# ==============================================================================

FROM oven/bun:1.4.4 AS base
WORKDIR /app

# Stage 1: Dependency resolution
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/sanctuary-api/package.json ./apps/sanctuary-api/
COPY packages/core/package.json ./packages/core/
COPY packages/database/package.json ./packages/database/
COPY packages/policies/package.json ./packages/policies/

RUN bun install --frozen-lockfile || bun install

# Stage 2: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy workspace dependencies and package manifests
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/sanctuary-api/node_modules ./apps/sanctuary-api/node_modules
COPY apps/sanctuary-api ./apps/sanctuary-api
COPY packages ./packages

# Non-root user for principle of least privilege
USER bun

EXPOSE 3000

# Native health probe for Render blue-green zero-downtime deployment
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

WORKDIR /app/apps/sanctuary-api
CMD ["bun", "src/index.ts"]
