FROM node:22-alpine AS client-builder

WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:22-alpine AS server-builder

WORKDIR /app/server
COPY server/package.json ./
RUN npm install --omit=dev

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY server ./server
COPY database ./database
COPY --from=client-builder /app/client/dist ./client/dist

WORKDIR /app/server
EXPOSE 3000
CMD ["npm", "start"]
