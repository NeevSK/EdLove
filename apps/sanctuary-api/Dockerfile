# Sanctuary API: one production Node runtime and its verified drain path.
FROM docker.io/library/node:24.22.2-bookworm-slim AS dependencies
WORKDIR /app
ENV CI=true
ENV HUSKY=0
RUN corepack enable
COPY . .
RUN node -e "const fs = require('node:fs'); if (process.versions.node !== fs.readFileSync('.nvmrc', 'utf8').trim()) throw new Error('Container Node version differs from .nvmrc')"
RUN pnpm --filter @repo/sanctuary-api... install --frozen-lockfile
RUN pnpm --filter @repo/sanctuary-api build

FROM docker.io/library/node:24.22.2-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/sanctuary-api/dist ./apps/sanctuary-api/dist
COPY --from=dependencies /app/apps/sanctuary-api/package.json ./apps/sanctuary-api/package.json
COPY --from=dependencies /app/apps/sanctuary-api/node_modules ./apps/sanctuary-api/node_modules
COPY --from=dependencies /app/packages ./packages
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + process.env.PORT + '/health/ready').then(r => { if (!r.ok) process.exitCode = 1; }, () => { process.exitCode = 1; })"
WORKDIR /app/apps/sanctuary-api
CMD ["node", "dist/entry-node.js"]
