## Etapa de build
FROM node:22-alpine AS builder

# Instalar compatibilidad necesaria
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json package-lock.json* ./

# Instalamos dependencias (con legacy-peer-deps por el tema de date-fns)
RUN npm install --legacy-peer-deps
RUN npm install sharp --legacy-peer-deps

# Copiamos el resto del código
COPY . .


# Declaramos que esperamos recibir esta variable durante el build
ARG NEXT_PUBLIC_API_URL
# La asignamos al entorno para que Next.js la vea
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# ---------------------------

# Build de Next.js
RUN npm run build

## Etapa de producción
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]