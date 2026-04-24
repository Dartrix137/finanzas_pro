# Use the official Bun image
FROM oven/bun:1.1 as base
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build time (if needed)
ENV NEXT_TELEMETRY_DISABLED 1

RUN bun run build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-privileged user
RUN adduser --system --uid 1001 nextjs
RUN addgroup --system --gid 1001 nodejs

# Copy the standalone build from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run the application
CMD ["bun", "server.js"]
