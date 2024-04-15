# Node 22 is the current LTS line; .nvmrc and package.json "engines" match.
FROM node:22-bookworm-slim AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /usr/src/app/build ./build
USER node
EXPOSE 3006
CMD ["node", "build/src/server.js"]
