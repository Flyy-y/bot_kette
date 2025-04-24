# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and source code
COPY package*.json ./
COPY index.js utils.js answerMap.json ./

# Install dependencies including dev dependencies for ncc
RUN npm ci && \
    npm run build && \
    npm cache clean --force

# Runtime stage
FROM alpine

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install Node.js runtime dependencies only (no npm)
RUN apk add --no-cache \
    libstdc++ \
    libuv \
    ca-certificates

# Install Node.js 22 binary without npm
RUN apk add --no-cache nodejs=~22 --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy only the bundled application from build stage
COPY --from=build /app/dist /app
COPY --from=build /app/answerMap.json /app/

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Start the bot with the bundled file
CMD ["node", "index.js"]