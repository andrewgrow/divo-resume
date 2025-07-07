FROM node:22.17.0

WORKDIR /app
COPY package.json .
COPY index.js .

RUN npm install

CMD ["node", "index.js"]