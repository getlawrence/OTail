FROM node:18-alpine

RUN apk add --no-cache git make g++ python3 go

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]