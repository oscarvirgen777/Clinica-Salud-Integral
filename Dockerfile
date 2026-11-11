FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma7.config.ts .
EXPOSE 3000
CMD ["npx", "tsx", "watch", "src/index.ts"]   