FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
RUN npm install web-push --no-audit --no-fund 2>/dev/null || true
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm cache clean --force

# Minimal stage: prisma CLI + all its transitive deps (effect, c12, etc.)
# Installed fresh so npm resolves everything correctly
FROM node:22-alpine AS prisma-cli
WORKDIR /app
RUN printf '{"private":true,"dependencies":{"prisma":"7.7.0"}}\n' > package.json && \
    npm install --no-audit --no-fund && \
    npm cache clean --force

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Standalone Next.js (bundles its own node_modules inside)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Merge prisma CLI deps into the standalone's node_modules
# Docker COPY merges dirs — adds missing packages without touching existing ones
COPY --from=prisma-cli /app/node_modules ./node_modules

# web-push est déjà dans les dependencies → inclus dans le bundle standalone.
# On l'ajoute depuis le builder pour éviter une 2e installation qui sature le disque.
COPY --from=builder /app/node_modules/web-push ./node_modules/web-push

# Migration files (seulement le nécessaire pour `prisma db push`)
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /app/prisma.config.ts ./

COPY scripts/migrate.sh /migrate.sh
RUN chmod +x /migrate.sh
RUN mkdir -p /app/uploads

EXPOSE 3000
ENTRYPOINT ["/migrate.sh"]
CMD ["node", "server.js"]
