## Etapa de build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos todo el frontend (contexto debe ser la carpeta Front/)
COPY . .

# Instalamos dependencias
RUN npm install

# Build de Next.js (asegúrate de tener output: 'standalone' en next.config.mjs)
RUN npm run build

## Etapa de producción
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Usuario no-root para mayor seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 1) Copiamos el output standalone (incluye server.js y node_modules mínimos)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 2) Archivos estáticos de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3) Assets públicos (después de standalone para no sobreescribir nada)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Arranque en modo standalone
CMD ["node", "server.js"]

