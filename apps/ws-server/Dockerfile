FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./
COPY src ./src

# Install production dependencies only
RUN bun install --production

# Production stage
FROM oven/bun:1.3-alpine

# Create non-root user
RUN addgroup -g 1001 -S bunjs && adduser -S -u 1001 -G bunjs bunjs

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=bunjs:bunjs /app/node_modules ./node_modules
COPY --from=builder --chown=bunjs:bunjs /app/package.json ./
COPY --from=builder --chown=bunjs:bunjs /app/src ./src

USER bunjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Run the server
CMD ["bun", "src/index.ts"]
