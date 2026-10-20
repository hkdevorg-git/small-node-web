FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js email.js send-test-email.js ./

USER node

EXPOSE 10000

CMD ["node", "server.js"]
