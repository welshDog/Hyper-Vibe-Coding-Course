FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source
COPY . .

EXPOSE 4000

CMD ["node", "src/index.js"]
