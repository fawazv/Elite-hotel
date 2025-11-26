FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY dist ./dist

EXPOSE 4010

CMD ["node", "dist/index.js"]
