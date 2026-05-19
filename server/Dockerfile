# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
# Generate prisma client
RUN npx prisma generate

COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["npm", "start"]
