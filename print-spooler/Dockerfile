# syntax=docker/dockerfile:1

FROM node:22-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake
RUN npm install --production

COPY . .

CMD ["node", "app-spooler.js"]
