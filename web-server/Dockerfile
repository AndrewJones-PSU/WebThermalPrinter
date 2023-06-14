# syntax=docker/dockerfile:1

FROM node:16.14-alpine
ENV NODE_ENV=production

WORKDIR /app

# puppeteer needs chromium in order to work
RUN apk add --no-cache \
	chromium \
	nss \
	freetype \
	harfbuzz \
	ca-certificates \
	ttf-freefont
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package.json ./

RUN npm install --production

COPY . .

CMD ["node", "app-server.js"]
