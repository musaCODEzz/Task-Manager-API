# Dockerfile (production-ready) — Alpine + build deps in deps stage
# --- deps stage ---
FROM node:20-alpine AS deps
WORKDIR /app

# install build tools needed for node-gyp and sqlite3; symlink python
RUN apk add --no-cache \
      python3 \
      make \
      g++ \
      build-base \
      sqlite-dev \
      ca-certificates \
  && ln -sf /usr/bin/python3 /usr/bin/python

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- final runtime stage ---
FROM node:20-alpine
WORKDIR /app

# create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# copy built node_modules
COPY --from=deps /app/node_modules ./node_modules

# copy app source
COPY . .

# create data folder for sqlite and set permissions
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data /app

USER appuser
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]
