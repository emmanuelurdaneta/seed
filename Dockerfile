FROM node:24.22.1-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY --exclude=.git --exclude=.env --exclude=.env.* --exclude=node_modules --exclude=*.key --exclude=*.pem . .

RUN npm run build

USER node
