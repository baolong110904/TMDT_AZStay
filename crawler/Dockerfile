FROM mcr.microsoft.com/playwright:v1.43.1-jammy

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Remove dev dependencies
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# Expose port
EXPOSE 4000

# Start application
CMD ["yarn", "start"]