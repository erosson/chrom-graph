# loosely based on redwoodjs's dockerfile
FROM node:16.13.0-alpine as base

RUN mkdir /app
WORKDIR /app

FROM base as dependencies

COPY .yarn .yarn
COPY .yarnrc.yml .yarnrc.yml
COPY .pnp.cjs .pnp.cjs
COPY .pnp.loader.mjs .pnp.loader.mjs
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY webpack.config.js webpack.config.js
COPY tsconfig.json tsconfig.json

# RUN --mount=type=cache,target=/root/.yarn/berry/cache \
# --mount=type=cache,target=/root/.cache yarn install --immutable
RUN yarn install --immutable --immutable-cache

FROM node:16.13.0-alpine as build

COPY --from=dependencies /app /app
WORKDIR /app
COPY src src
# FROM build as x
RUN yarn build

# after building, `www` is static html
# https://hub.docker.com/_/nginx
FROM nginx as www
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/src/nginx.conf /etc/nginx/conf.d/default.conf
