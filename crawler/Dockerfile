FROM mcr.microsoft.com/playwright:v1.43.1-jammy

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ["yarn", "start"]
