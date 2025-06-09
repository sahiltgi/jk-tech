# Use the recommended slim tag to reduce vulnerabilities
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with security fixes
RUN npm ci --only=production && \
    npm install && npm audit fix --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - use the most secure recommended tag
FROM node:20-alpine AS production

# Create non-root user with specific IDs for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Copy built application and dependencies from builder
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Additional security hardening
RUN apk --no-cache add dumb-init && \
    rm -rf /var/cache/apk/*

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "run", "start:prod"]