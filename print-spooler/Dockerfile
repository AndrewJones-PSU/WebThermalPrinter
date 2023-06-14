# syntax=docker/dockerfile:1

FROM node:16.20-bullseye
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./

RUN npm install --production

COPY . .

CMD ["node", "app-spooler.js"]
