# Sử dụng Node.js 20 và có thể thêm Chromium
FROM node:20-slim

# Cài đặt các dependencies bắt buộc để Chromium hoạt động
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Tải Chromium đúng phiên bản Puppeteer yêu cầu
RUN npm install -g puppeteer@21.3.8 \
 && node -e "require('puppeteer').createBrowserFetcher().download('138.0.7204.157')"

# Tạo thư mục app
WORKDIR /app

# Copy package.json, lock và cài đặt deps
COPY package*.json ./
RUN npm install

# Copy toàn bộ code
COPY . .

# Thiết lập biến môi trường để Puppeteer-core tìm được Chromium
ENV PUPPETEER_EXECUTABLE_PATH="/node_modules/puppeteer/.local-chromium/linux-138.0.7204.157/chrome-linux/chrome"

# Lệnh khởi chạy app
CMD ["npm", "run", "start"]
