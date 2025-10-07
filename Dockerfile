# --- deps stage: build native modules and install production deps ---
FROM node:22-alpine AS deps
WORKDIR /app

# Install essential build tools
RUN apk add --no-cache python3 sqlite-dev ca-certificates \
    && ln -sf /usr/bin/python3 /usr/bin/python

# Copy package files and install production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- final runtime stage ---
FROM node:22-alpine AS prod
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Ensure a writable directory for DB and set ownership
RUN mkdir -p /app/db && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]