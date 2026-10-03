# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# Stage 1: Dependencies
# ------------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 2: Build (Next.js standalone output)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# NEXT_PUBLIC_* values are inlined into the client bundle at build time,
# so they must be provided as build args rather than runtime env vars.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
# Optional: version shown in the UI (empty = default in src/constants/app.ts)
ARG NEXT_PUBLIC_APP_VERSION=
# Optional: backend origin to proxy /api/* to (see next.config.ts)
ARG API_PROXY_TARGET=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION \
    API_PROXY_TARGET=$API_PROXY_TARGET

RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Minimal runtime image
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Security: run as an unprivileged user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000 || exit 1

CMD ["node", "server.js"]
