FROM node:16-bullseye

WORKDIR /app

# Native build deps (required for bcrypt, ffi-napi, etc.)
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libffi-dev \
  && rm -rf /var/lib/apt/lists/*

# Prevent prisma from auto-running during npm install
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Install dependencies WITHOUT scripts first
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source (including prisma schema)
COPY . .

# 🔴 Generate Prisma Client
RUN npx prisma generate

# 🔴 NOW rebuild native modules (bcrypt fix)
RUN npm rebuild bcrypt --build-from-source

# Build NestJS
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]

