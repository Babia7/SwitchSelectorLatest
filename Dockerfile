# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# --- Run stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Simple static file server
RUN npm install -g serve

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# Cloud Run will inject PORT
ENV PORT=8080
EXPOSE 8080

# Use PORT if provided, fallback to 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
