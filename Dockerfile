# Node 16 went end-of-life in September 2023. TypeORM 0.3 and the ulid/zod
# stack here are fine on 20 LTS.
FROM node:20-bookworm-slim AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
# The original image never ran this, so `npm start` looked for build/src/server.js
# in an image where build/ had never been produced.
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /usr/src/app/build ./build
EXPOSE 3006
CMD ["npm", "start"]
