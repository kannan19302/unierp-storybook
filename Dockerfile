# unierp-storybook — Design System UI Component Catalog
#
# Multi-stage Dockerfile:
# 1. Builder: Builds Storybook static bundle on port 6006
# 2. Runner: Lightweight Nginx Alpine serves static Storybook files on port 6006

# ── Stage 1: Base Storybook ───────────────────────────────────────────────
FROM node:22-slim AS base
WORKDIR /app

COPY package.json package-lock.json* ./

ARG UNIERP_REGISTRY=http://host.docker.internal:4873/
RUN printf '@kannan19302:registry=%s\nregistry=https://registry.npmjs.org/\n' "$UNIERP_REGISTRY" > .npmrc \
 && rm -f package-lock.json \
 && npm install --no-audit --no-fund

COPY . .

# ── Stage: Dev Storybook ──────────────────────────────────────────────────
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 6006
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:6006/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npx", "storybook", "dev", "-p", "6006", "--host", "0.0.0.0", "--no-open", "--ci"]

# ── Stage: Builder ────────────────────────────────────────────────────────
FROM base AS builder
RUN npm run build-storybook

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/storybook-static /usr/share/nginx/html

RUN printf 'server {\n    listen 6006;\n    server_name localhost;\n    location / {\n        root /usr/share/nginx/html;\n        index index.html;\n        try_files $uri $uri/ /index.html;\n    }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 6006

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:6006/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
