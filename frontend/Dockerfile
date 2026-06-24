# ── 依赖安装阶段 ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# ── 构建阶段 ──
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && pnpm build

# ── 运行阶段 ──
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 主题和模板（运行时需要）
COPY --from=builder /app/themes ./themes
COPY --from=builder /app/src/templates ./src/templates

EXPOSE 3000
CMD ["node", "server.js"]

# force rebuild
