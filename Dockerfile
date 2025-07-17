FROM node:22.17.0

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY src ./src

RUN mkdir /app/cache

# dependecies for pupeeter
RUN apt-get update && \
    apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libu2f-udev \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN npm install

# create pupeeter's user
RUN useradd -m pptruser
USER pptruser

CMD ["npm", "start"]