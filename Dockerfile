# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.mjs file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager (include lockfile in build context; do not add pnpm-lock.yaml to .dockerignore)
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile; \
  else pnpm install; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public exists so runner COPY does not fail (Next.js may have no public folder)

# Payload needs PAYLOAD_SECRET at build time (Next.js collects page data and inits Payload).
# Use a placeholder here; set the real secret at runtime via fly secrets set PAYLOAD_SECRET=...
# ARG PAYLOAD_SECRET=build-time-placeholder
# ENV PAYLOAD_SECRET=$PAYLOAD_SECRET

# ARG DATABASE_URL=build-time-placeholder
# ENV DATABASE_URL=$DATABASE_URL

# Build with secrets from: fly deploy --build-secret PAYLOAD_SECRET --build-secret DATABASE_URL
RUN --mount=type=secret,id=PAYLOAD_SECRET \
    --mount=type=secret,id=DATABASE_URL \
    export PAYLOAD_SECRET="$(cat /run/secrets/PAYLOAD_SECRET)" && \
    export DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" && \
    corepack enable && corepack prepare pnpm@latest --activate && \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    else pnpm run build; fi


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Remove this line if you do not have this folder
# COPY --from=builder /app .

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
# Bind to 0.0.0.0 so Fly.io (and any external client) can reach the app
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
