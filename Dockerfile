# ---- Build stage ----
FROM node:22-alpine AS build

# Create app directory
WORKDIR /app

# Install dependencies (use package.json / package-lock.json if present)
COPY package*.json ./
RUN npm install

# Copy the rest of the source
COPY . .

# Build the Vite React app
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine

WORKDIR /app

# Copy the built static files from the build stage
COPY --from=build /app/dist ./dist

# Simple static file server
RUN npm install -g serve

# Cloud Run sets PORT; default to 8080 for local testing
ENV PORT=8080

EXPOSE 8080

# Serve the built app on the Cloud Run port
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
