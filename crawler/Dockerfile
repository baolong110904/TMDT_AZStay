FROM mcr.microsoft.com/playwright:v1.54.1-jammy

WORKDIR /app

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies
RUN yarn install --production=false

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Remove dev dependencies
RUN yarn install --production=true && yarn cache clean

# Expose port
EXPOSE 4000

# Start application
CMD ["yarn", "start"]