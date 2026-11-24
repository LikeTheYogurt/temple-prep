# ---------- Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies and build
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM nginx:alpine
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Use custom nginx config for SPA fallback (will be added next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# ---------- Runtime ----------
FROM nginx:alpine
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Use custom nginx config for SPA fallback (will be added next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
