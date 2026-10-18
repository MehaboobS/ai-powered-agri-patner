# =========================================================
# Stage 1: Build Frontend Assets with Node 20
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Build production bundle
RUN npm run build

# =========================================================
# Stage 2: Serve with Production-Grade Nginx
# =========================================================
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with /api reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
