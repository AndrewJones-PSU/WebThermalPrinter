# syntax=docker/dockerfile:1

FROM node:22-alpine
ENV NODE_ENV=production

WORKDIR /app

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer installs, work.
RUN apk update && \
  apk add --no-cache nmap && \
  echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
  echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
  apk update && \
  apk add --no-cache \
    chromium \
    harfbuzz \
    "freetype>2.8" \
    ttf-freefont \
    nss

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json ./

RUN npm install --production

# Add a group and user for puppeteer access
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /home/appuser/Downloads
RUN chown -R appuser:appgroup /home/appuser
RUN chown -R appuser:appgroup /app/node_modules
RUN chown -R appuser:appgroup /app/package.json
RUN chown -R appuser:appgroup /app/package-lock.json

COPY . .

# Run everything after as non-privileged user.
USER appuser

CMD ["node", "app-server.js"]
