# syntax=docker/dockerfile:1.7

FROM oven/bun:1.2.14 AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Tools needed for phantomjs-prebuilt (bzip2)
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt/lists \
    apt-get update && \
    apt-get install -y --no-install-recommends bzip2 && \
    rm -rf /var/lib/apt/lists/*

FROM base AS deps
ENV BUN_INSTALL_CACHE=/root/.cache/bun
ARG BUN_CACHE_ID=bun-install-v2

# Copy dependency manifests (bun only)
COPY bun.lock package.json ./

# Install deps (keeps lockstep with bun.lock)
RUN --mount=type=cache,id=${BUN_CACHE_ID},target=/root/.cache/bun \
    bun install --frozen-lockfile


FROM deps AS builder
ARG DATABASE_URL=postgresql://placeholder:placeholder@sistem_antrean_db:5432/sistem_antrean
ENV DATABASE_URL=${DATABASE_URL}

# Copy source
COPY prisma ./prisma
COPY src ./src
COPY public ./public
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.base.json ./tsconfig.base.json
COPY next.config.ts ./next.config.ts
COPY postcss.config.mjs ./postcss.config.mjs
COPY eslint.config.mjs ./eslint.config.mjs
COPY components.json ./components.json

# Generate Prisma client and build
RUN --mount=type=cache,id=${BUN_CACHE_ID},target=/root/.cache/bun bunx prisma generate
RUN --mount=type=cache,id=${BUN_CACHE_ID},target=/root/.cache/bun \
    --mount=type=cache,id=next-cache,target=/app/.next/cache \
    bun run build


FROM base AS runner

# Copy runtime artifacts
COPY --from=deps --link /app/node_modules ./node_modules
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder --link /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run start -- --hostname 0.0.0.0 --port ${PORT}"]
