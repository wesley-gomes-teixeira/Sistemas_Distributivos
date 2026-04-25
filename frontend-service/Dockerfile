FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY globals.d.ts ./

RUN npm install

COPY public ./public
COPY server.ts ./server.ts

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/server.js"]
