FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --omit=dev --build-from-source=sqlite3

COPY . .

ENV NODE_ENV=production

EXPOSE 8080

CMD ["npm", "start"]