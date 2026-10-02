# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# Stage 1: Install all dependencies (dev + prod) for compilation
# ------------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Husky's "prepare" hook needs a git checkout, which a Docker build doesn't have
RUN npm pkg delete scripts.prepare && npm ci

# ------------------------------------------------------------------------------
# Stage 2: Compile TypeScript -> dist/
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Production-only dependencies
# ------------------------------------------------------------------------------
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm pkg delete scripts.prepare \
  && npm ci --omit=dev \
  && npm cache clean --force

# ------------------------------------------------------------------------------
# Stage 4: Minimal runtime image
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    APP_ENV=production \
    APP_PORT=4000

# Configuration is supplied at runtime via environment variables only;
# no .env files are baked into the image.
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Security: run as the unprivileged "node" user
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://127.0.0.1:${APP_PORT}/api/v1/health" || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
