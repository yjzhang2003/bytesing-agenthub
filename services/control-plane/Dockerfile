FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json packages/contracts/package.json
COPY services/control-plane/package.json services/control-plane/package.json
RUN pnpm install --frozen-lockfile --filter @agenthub/control-plane...

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/contracts packages/contracts
COPY services/control-plane services/control-plane
RUN pnpm --filter @agenthub/control-plane build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV AGENTHUB_CONTROL_PLANE_ENTRY=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=deps /app/services/control-plane/node_modules ./services/control-plane/node_modules
COPY --from=build /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=build /app/dist/packages/contracts/src ./packages/contracts/dist
COPY --from=build /app/dist/services/control-plane/src ./services/control-plane/dist
COPY --from=build /app/services/control-plane/package.json ./services/control-plane/package.json
CMD ["node", "services/control-plane/dist/index.js"]
