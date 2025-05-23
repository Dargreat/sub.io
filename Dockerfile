FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN apk add --no-cache ffmpeg

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server/server.js"]