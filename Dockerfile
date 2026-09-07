# syntax=docker/dockerfile:1

# ~ Etape 1 : build de l'application statique
FROM node:22-alpine AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ~ Etape 2 : image finale minimale, nginx sans privileges (utilisateur non-root, port 8080)
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
