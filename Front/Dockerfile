## 1. Etapa de dependencias y construcción
FROM node:22-alpine AS builder

# Instalar libc6-compat (Crítico para que Next.js y Sharp funcionen bien en Alpine)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiamos archivos de dependencias primero para aprovechar la caché de Docker
COPY package.json package-lock.json* ./

# Instalamos dependencias (agregamos sharp explícitamente para optimización de imágenes)
RUN npm install
RUN npm install sharp

# Copiamos el resto del código
COPY . .


# Construimos la aplicación
RUN npm run build

## 2. Etapa de producción (Runner)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instalar libc6-compat también en el runner
RUN apk add --no-cache libc6-compat

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar el contenido 'standalone' generado por el build
# Esto incluye las dependencias necesarias y el server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copiar archivos estáticos (imágenes, fuentes, estilos generados)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El comando standard para modo standalone
CMD ["node", "server.js"]