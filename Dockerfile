# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Runtime stage
FROM node:22-alpine

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy only production dependencies from build stage
COPY --from=build /app/node_modules /app/node_modules

# Copy source code
COPY ./index.js ./utils.js ./answerMap.json ./

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Start the bot
CMD ["node", "index.js"]