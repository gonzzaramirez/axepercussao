# Despliegue en VPS con Dokploy

## Requisitos

- Servidor con Docker
- PostgreSQL (contenedor o externo)
- Dominios o IPs para Front y API

## 1. Base de datos

Crear una base PostgreSQL y anotar la URL:

```txt
postgresql://usuario:contraseña@host:5432/axepercussao
```

## 2. Backend (`back/`)

- **Contexto de build**: carpeta `back/` (desde la raíz del repo: `docker build -f back/Dockerfile back/`).
- **Variables de entorno** (en Dokploy o `.env`):
  - `DATABASE_URL` — URL de PostgreSQL
  - `JWT_SECRET` — secreto para JWT (ej: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
  - `FRONTEND_URL` — URL pública del front (ej: `https://axepercussao.com`) para CORS y cookies
  - `PORT` — opcional, por defecto 3080
  - `RESEND_API_KEY`, `EMAIL_FROM`, `WHATSAPP_NUMBER` — según uso

Después del primer deploy:

```bash
# Migraciones
npx prisma migrate deploy

# Admin inicial (solo una vez)
npm run seed:admin
```

## 3. Frontend (`Front/`)

- **Contexto de build**: carpeta `Front/`.
- **Build args** (obligatorios en producción):
  - `NEXT_PUBLIC_API_URL` — URL pública del backend (ej: `https://api.axepercussao.com`)
  - `NEXT_PUBLIC_SITE_URL` — opcional, URL del sitio (ej: `https://axepercussao.com`), por defecto axepercussao.com

En Dokploy: en la configuración del servicio Front, añadir **Build Args**:

```txt
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

- **Variables de entorno en runtime** (opcionales si ya se pasaron en build): mismas `NEXT_PUBLIC_*` si el stack las usa en runtime.

## 4. Orden de despliegue

1. Desplegar PostgreSQL (si aplica).
2. Desplegar **Back** con las env correctas; ejecutar `prisma migrate deploy` y `seed:admin`.
3. Desplegar **Front** con los build args indicados.

## 5. Comprobaciones

- Back: `GET https://api.tudominio.com/` (health).
- Front: abrir la web, login en `/dashboard/login`, catálogo en `/productos` (debe cargar desde la API; sin productos si la BD está vacía).
- CORS: `FRONTEND_URL` en el back debe coincidir con la URL del front.

## 6. Catálogo inicial (opcional)

Si querés cargar productos de ejemplo desde el seed:

```bash
cd back && npm run seed:catalog
```

En producción normalmente se cargan productos desde el dashboard.
