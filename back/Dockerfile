FROM node:22.12.0-alpine

# Necesario para Prisma + PostgreSQL
RUN apk -U add openssl

WORKDIR /app

# Copiamos todo el backend (contexto debe ser la carpeta back/)
COPY . .

# Instalamos dependencias (incluye devDependencies para poder buildear Nest)
RUN npm install --include=dev

# Generamos Prisma Client
RUN npx prisma generate

# Build de NestJS
RUN npm run build

EXPOSE 3080

# Nest compila a dist/src/main.js (sourceRoot: src)
CMD ["node", "dist/src/main.js"]
