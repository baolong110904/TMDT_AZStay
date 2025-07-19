# Base image with Node.js
FROM node:20-slim

# Install dependencies for Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    libgl1 \
    unzip \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set environment variable for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Chromium manually (v138 stable)
RUN mkdir -p /usr/src/chromium && \
    cd /usr/src/chromium && \
    wget https://storage.googleapis.com/chrome-for-testing-public/138.0.7204.157/linux64/chrome-linux64.zip && \
    unzip chrome-linux64.zip && \
    mv chrome-linux64 /opt/chromium && \
    ln -s /opt/chromium/chrome /usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package.json and install
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose port (if needed)
EXPOSE 3000

# Run app
CMD ["npm", "start"]
