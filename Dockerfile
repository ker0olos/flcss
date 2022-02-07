FROM mcr.microsoft.com/playwright:focal

ENV PATH="${PATH}:/app/node_modules/.bin"

WORKDIR /app
COPY . /app

RUN yarn

RUN yarn build
