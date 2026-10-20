# syntax=docker/dockerfile:1

# ---- deps: install dependencies (cached separately from source) ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# ---- prisma-base: Prisma CLI + generated client, used by the migrator ----
FROM deps AS prisma-base
WORKDIR /app

ENV DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# ---- builder: Next standalone build ----
FROM prisma-base AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
# Keep the build inside the memory budget of a 2 GB instance (2 GB swap is added too).
ENV NODE_OPTIONS=--max-old-space-size=1536
# Some modules construct SDK clients at import time. These placeholders only
# unblock `next build`; the real values come from the runtime environment.
ENV RESEND_API_KEY=re_build_placeholder
ENV OPENAI_API_KEY=sk-build-placeholder

# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

COPY . .
RUN npm run build

# ---- runner: minimal production image ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
