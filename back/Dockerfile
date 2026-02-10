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

# Verificación en logs (útil en Dokploy para depurar paths)
RUN ls -la dist && ls -la dist/src

EXPOSE 3080

# EntryPoint: usa estructura estándar Nest v11 (dist/main.js)
CMD ["node", "dist/main.js"]

