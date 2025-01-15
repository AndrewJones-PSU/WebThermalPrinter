# syntax=docker/dockerfile:1

FROM node:22-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./

RUN npm install --production

COPY . .

# add discord commands to the bot
WORKDIR /app/commands
ARG REGISTER_COMMANDS=false
RUN if [ "$REGISTER_COMMANDS" = "true" ] ; then node register.js ; fi
ARG REGISTER_COMMANDS_DEV=false
RUN if [ "$REGISTER_COMMANDS_DEV" = "true" ] ; then node registerdev.js ; fi

WORKDIR /app

CMD ["node", "app-discordbot.js"]
