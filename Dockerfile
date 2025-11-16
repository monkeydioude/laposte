FROM node:lts-alpine AS builder

RUN apk add --no-cache bash make

WORKDIR /app
COPY Makefile tsconfig.json package.json package-lock.json ./
COPY src ./src/
COPY migrations ./migrations

RUN make build

# COPY templates ./templates/
# COPY .env config.yml ./

CMD ["node", "dist/main.js"]
