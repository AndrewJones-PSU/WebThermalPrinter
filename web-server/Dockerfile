# syntax=docker/dockerfile:1

FROM node:16.14-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./

RUN npm install --production

COPY . .

COPY ./../config.json ./config.json
COPY ./../env.json ./env.json

CMD ["node", "app-server.js"]
