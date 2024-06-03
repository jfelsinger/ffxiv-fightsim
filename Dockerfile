FROM oven/bun:1 as base
WORKDIR /usr/src/app

FROM base as install
RUN mkdir -p /temp/pkg
COPY package.json bun.lockb /temp/pkg/
WORKDIR /temp/pkg
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=install /temp/pkg/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM base as app
COPY --from=install /temp/pkg/node_modules node_modules
COPY --from=build /usr/src/app/.output .output

USER bun
ARG PORT
EXPOSE ${PORT:-3000}
ENTRYPOINT [ "bun", "run", ".output/server/index.mjs" ]
