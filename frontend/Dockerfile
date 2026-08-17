# Etapa 1: build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: runtime (server Node con SSR)
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist/frontend ./dist/frontend
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/frontend/server/server.mjs"]