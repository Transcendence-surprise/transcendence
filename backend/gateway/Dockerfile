# ==============================================
# Stage 1: Development (for hot reload)
# ==============================================
FROM node:20-alpine AS development

# Set working directory inside container
WORKDIR /app

# Copy package files first (for Docker layer caching)
# If package.json doesn't change, npm install won't run again
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
# --legacy-peer-deps: Resolve dependency conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
# This layer is rebuilt when source files change
COPY . .

# Expose port 3001 for auth
EXPOSE 3002

# Default command for development (with hot reload)
# This can be overridden in docker-compose.yml
CMD ["npm", "run", "start:dev"]


# ==============================================
# Stage 2: Builder (compile TypeScript)
# ==============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript to JavaScript
# Output goes to dist/ folder
RUN npm run build


# ==============================================
# Stage 3: Production (optimized, minimal)
# ==============================================
FROM node:20-alpine AS production

# Run as non-root user for security
# node user is built into node:alpine image
USER node

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (no devDependencies)
# --omit=dev: Skip devDependencies like TypeScript, @types, etc.
RUN npm ci --omit=dev --legacy-peer-deps

# Copy compiled JavaScript from builder stage
# This is the dist/ folder created by 'npm run build'
COPY --from=builder --chown=node:node /app/dist ./dist

# Expose port
EXPOSE 3002

# Run the compiled JavaScript (not TypeScript!)
# node dist/main.js is much faster than npm/nest start
CMD ["node", "dist/main.js"]
