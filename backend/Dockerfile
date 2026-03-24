FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src

EXPOSE 5000

CMD ["npm", "run", "dev"]
