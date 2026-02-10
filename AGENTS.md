# AGENTS.md — Blueprint para E-commerce con Checkout por WhatsApp

> **Propósito**: Este documento es un blueprint completo para que un agente de IA replique desde cero una tienda e-commerce fullstack con arquitectura idéntica. Adaptable a cualquier rubro.
>
> **Stack**: Next.js 16 (App Router) + NestJS 11 + Prisma 7 + PostgreSQL + Tailwind CSS v4 + shadcn/ui
>
> **Modelo de negocio**: Tienda online con checkout vía WhatsApp (sin pasarela de pago), panel de administración, gestión de pedidos, emails transaccionales, y PWA.

---

## ÍNDICE

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Estructura de Carpetas](#2-estructura-de-carpetas)
3. [Backend — NestJS](#3-backend--nestjs)
4. [Frontend — Next.js](#4-frontend--nextjs)
5. [Base de Datos — Prisma + PostgreSQL](#5-base-de-datos--prisma--postgresql)
6. [Autenticación y Seguridad](#6-autenticación-y-seguridad)
7. [API — Contratos y Endpoints](#7-api--contratos-y-endpoints)
8. [Flujos de Negocio](#8-flujos-de-negocio)
9. [UI/UX — Sistema de Diseño](#9-uiux--sistema-de-diseño)
10. [SEO y PWA](#10-seo-y-pwa)
11. [Emails Transaccionales](#11-emails-transaccionales)
12. [Despliegue — Docker + Producción](#12-despliegue--docker--producción)
13. [Paso a Paso para Replicar](#13-paso-a-paso-para-replicar)
14. [Decisiones de Arquitectura y Por Qué](#14-decisiones-de-arquitectura-y-por-qué)
15. [Variables de Entorno](#15-variables-de-entorno)
16. [Checklist Final](#16-checklist-final)

---

## 1. Visión General del Proyecto

### Concepto

E-commerce para venta de productos con múltiples categorías y variantes. El modelo de negocio es:

1. **Catálogo público** — Los clientes navegan productos organizados por tipo/categoría
2. **Carrito de compras** — Agregan productos al carrito (persistido en sessionStorage)
3. **Checkout como invitado** — Completan datos personales + dirección de envío (sin necesidad de registrarse)
4. **Pedido por WhatsApp** — Se genera un pedido en la base de datos y se redirige a WhatsApp con el resumen formateado
5. **Admin confirma pago** — El administrador verifica el pago por transferencia y confirma desde el dashboard
6. **Notificación por email** — El cliente recibe email de confirmación
7. **Envío y tracking** — El admin agrega código de seguimiento, el cliente recibe email y puede rastrear en una página pública

### Arquitectura

```
┌─────────────────────┐     HTTP/REST      ┌──────────────────────┐
│                     │    (cookies JWT)    │                      │
│   Next.js 16        │◄──────────────────►│   NestJS 11          │
│   (Frontend)        │    credentials:     │   (API REST)         │
│   Puerto 3000       │    include          │   Puerto 3080        │
│                     │                     │                      │
│   - App Router      │                     │   - Prisma ORM       │
│   - shadcn/ui       │                     │   - JWT Auth         │
│   - Tailwind v4     │                     │   - class-validator  │
│   - React Context   │                     │   - Resend (emails)  │
└─────────────────────┘                     └──────────┬───────────┘
                                                       │
                                                       │ Prisma Client
                                                       ▼
                                            ┌──────────────────────┐
                                            │   PostgreSQL         │
                                            │   (Base de datos)    │
                                            └──────────────────────┘
```

### Monorepo (mismo repositorio, dos carpetas raíz)

```
Proyecto/
├── Back/       ← NestJS API
├── Front/      ← Next.js App
└── AGENTS.md   ← Este archivo
```

> **IMPORTANTE**: NO es un monorepo con workspaces. Son dos proyectos independientes con sus propios `package.json`, `node_modules`, y `Dockerfile`.

---

## 2. Estructura de Carpetas

### Backend (`Back/`)

```
Back/
├── prisma/
│   ├── schema.prisma              # Esquema de la base de datos
│   ├── migrations/                # Migraciones automáticas
│   └── seed-admin.ts              # Script para crear admin inicial
├── src/
│   ├── main.ts                    # Entry point: CORS, Helmet, ValidationPipe, cookies
│   ├── app.module.ts              # Módulo raíz: imports, guards globales
│   ├── app.controller.ts          # Health check
│   ├── app.service.ts             # Servicio raíz
│   │
│   ├── prisma/                    # Módulo Prisma (global)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts      # Singleton del cliente Prisma
│   │
│   ├── auth/                      # Autenticación JWT
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts     # Login, logout, refresh, me, check
│   │   ├── auth.service.ts        # Lógica de autenticación
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts    # Estrategia JWT (extrae de cookies)
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts  # Guard global (todas las rutas protegidas por defecto)
│   │   │   └── roles.guard.ts     # Guard de roles (ADMIN)
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts   # @Public() para rutas sin auth
│   │   │   └── roles.decorator.ts    # @Roles('ADMIN')
│   │   └── dto/
│   │       └── login.dto.ts
│   │
│   ├── products/                  # CRUD de productos
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── bulk-price-update.dto.ts
│   │   └── entities/
│   │       └── product.entity.ts
│   │
│   ├── categories/                # CRUD de categorías
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   └── update-category.dto.ts
│   │   └── entities/
│   │       └── category.entity.ts
│   │
│   ├── orders/                    # Gestión de pedidos
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── dto/
│   │       ├── create-order.dto.ts
│   │       └── update-order.dto.ts
│   │
│   ├── discount-codes/            # Códigos de descuento
│   │   ├── discount-codes.module.ts
│   │   ├── discount-codes.controller.ts
│   │   ├── discount-codes.service.ts
│   │   └── dto/
│   │       ├── create-discount-code.dto.ts
│   │       ├── update-discount-code.dto.ts
│   │       └── validate-discount-code.dto.ts
│   │
│   └── email/                     # Emails transaccionales (global)
│       ├── email.module.ts
│       └── email.service.ts       # Templates HTML + Resend API
│
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── Dockerfile
├── env.example
└── .prettierrc
```

### Frontend (`Front/`)

```
Front/
├── app/                               # Next.js App Router
│   ├── layout.tsx                     # Root layout: fonts, providers, metadata, JSON-LD
│   ├── globals.css                    # Estilos globales, variables CSS, animaciones
│   ├── landing.css                    # Estilos específicos del landing
│   ├── robots.ts                      # Generador de robots.txt
│   ├── sitemap.ts                     # Generador dinámico de sitemap.xml
│   │
│   ├── (main)/                        # Route group: páginas públicas con footer
│   │   ├── layout.tsx                 # Layout con Footer
│   │   └── page.tsx                   # Landing: Hero + Productos destacados + Contacto
│   │
│   ├── productos/                     # Catálogo general
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Grid con filtros por categoría
│   │   ├── [slug]/
│   │   │   └── page.tsx              # Detalle de producto (SSR + metadata dinámica)
│   │   └── components/
│   │       ├── product-card.tsx
│   │       ├── product-grid.tsx
│   │       └── product-detail-client.tsx
│   │
│   ├── [tipo-producto]/               # Páginas por tipo (ej: suplementos, indumentaria, accesorios)
│   │   ├── layout.tsx                 # Metadata específica del tipo
│   │   ├── page.tsx                   # Grid filtrado por ProductType
│   │   └── [slug]/
│   │       └── page.tsx              # Detalle específico del tipo
│   │
│   ├── pedido/                        # Seguimiento público de pedidos
│   │   └── [id]/
│   │       └── page.tsx              # Estado, tracking, items
│   │
│   └── dashboard/                     # Panel de administración
│       ├── layout.tsx                 # Layout con sidebar
│       ├── dashboard.css              # Estilos del dashboard (tema claro)
│       ├── page.tsx                   # Home del dashboard
│       ├── login/
│       │   └── page.tsx              # Login admin
│       ├── productos/
│       │   ├── page.tsx              # CRUD productos con DataTable
│       │   └── components/
│       │       ├── columns.tsx        # Definición de columnas
│       │       ├── create-product-dialog.tsx
│       │       ├── edit-product-dialog.tsx
│       │       └── data-table.tsx
│       ├── categorias/
│       │   └── page.tsx
│       ├── pedidos/
│       │   └── page.tsx              # Gestión de pedidos + estados + tracking
│       ├── descuentos/
│       │   └── page.tsx
│       └── precios/
│           └── page.tsx              # Actualización masiva de precios
│
├── components/                        # Componentes compartidos
│   ├── ui/                            # shadcn/ui (60+ componentes)
│   ├── header.tsx                     # Navegación + menú móvil + carrito
│   ├── footer.tsx                     # Footer con redes sociales
│   ├── hero-section.tsx               # Hero del landing con animaciones
│   ├── cart-sidebar.tsx               # Sidebar del carrito (Sheet)
│   ├── checkout-form.tsx              # Formulario de checkout completo
│   ├── contact-section.tsx            # Sección de contacto
│   ├── availability-check-modal.tsx   # Modal de consulta WhatsApp
│   └── theme-provider.tsx             # Provider de temas (next-themes)
│
├── context/
│   └── cart-context.tsx               # Estado global del carrito (React Context)
│
├── hooks/                             # Custom hooks
│
├── lib/
│   ├── api/                           # Funciones de llamada a la API
│   │   ├── auth.ts                    # Login, logout, refresh, check
│   │   ├── product.ts                 # CRUD productos
│   │   ├── category.ts               # CRUD categorías
│   │   ├── order.ts                   # Crear/gestionar pedidos
│   │   ├── discount-code.ts           # Validar/gestionar descuentos
│   │   └── georef.ts                  # API GeoRef Argentina (provincias/localidades)
│   ├── types/
│   │   └── index.ts                   # Todas las interfaces TypeScript
│   ├── utils.ts                       # cn() para clases de Tailwind
│   ├── products.ts                    # formatPrice() y utilidades de productos
│   └── whatsapp.ts                    # Generación de mensajes WhatsApp
│
├── public/
│   ├── manifest.json                  # PWA manifest
│   ├── site.webmanifest
│   ├── robots.txt
│   └── [iconos y assets estáticos]
│
├── components.json                    # Configuración shadcn/ui
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── Dockerfile
└── env.example
```

---

## 3. Backend — NestJS

### 3.1 Dependencias Exactas

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/throttler": "^6.5.0",
    "@nestjs/mapped-types": "*",
    "@prisma/client": "^7.2.0",
    "@prisma/adapter-pg": "^7.2.0",
    "bcrypt": "^6.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.3",
    "cookie-parser": "^1.4.7",
    "dotenv": "^17.2.3",
    "helmet": "^8.1.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "resend": "^6.7.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "prisma": "^7.2.0",
    "typescript": "^5.7.3",
    "ts-node": "^10.9.2",
    "jest": "^30.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.8",
    "@types/express": "^5.0.2",
    "@types/passport-jwt": "^4.0.1",
    "eslint": "^9.18.0",
    "prettier": "^3.4.2"
  }
}
```

### 3.2 Configuración del Entry Point (`main.ts`)

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Seguridad: Headers HTTP con Helmet
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // 2. Parser de cookies (para JWT en httpOnly cookies)
  app.use(cookieParser());

  // 3. Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true,   // Error si envían propiedades extra
      transform: true,              // Auto-transform a instancias del DTO
    }),
  );

  // 4. CORS configurado para el frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,              // Habilita envío de cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(process.env.PORT ?? 3080);
}
bootstrap();
```

### 3.3 Módulo Raíz (`app.module.ts`)

```typescript
@Module({
  imports: [
    // Variables de entorno globales
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Rate limiting: 100 req/min por IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    
    // Módulos de la aplicación
    PrismaModule,      // Global — Acceso a BD
    AuthModule,        // Autenticación JWT
    EmailModule,       // Global — Emails transaccionales
    CategoriesModule,  // CRUD Categorías
    ProductsModule,    // CRUD Productos
    OrdersModule,      // Gestión de pedidos
    DiscountCodesModule, // Códigos de descuento
  ],
  providers: [
    // Guards GLOBALES (se aplican a TODAS las rutas)
    { provide: APP_GUARD, useClass: ThrottlerGuard },    // Rate limiting
    { provide: APP_GUARD, useClass: JwtAuthGuard },      // JWT (por defecto todo protegido)
    { provide: APP_GUARD, useClass: RolesGuard },        // Roles
  ],
})
export class AppModule {}
```

> **Patrón clave**: Todas las rutas están protegidas por defecto. Se usa `@Public()` para marcar rutas públicas. Se usa `@Roles('ADMIN')` para restringir a admins.

### 3.4 Patrón de cada Módulo

Cada módulo sigue esta estructura consistente:

```
modulo/
├── modulo.module.ts          # Imports de PrismaModule + (opcionalmente EmailModule)
├── modulo.controller.ts      # Endpoints REST
├── modulo.service.ts         # Lógica de negocio + queries Prisma
├── dto/
│   ├── create-modulo.dto.ts  # Validación con class-validator
│   └── update-modulo.dto.ts  # Extiende CreateDto con PartialType
└── entities/
    └── modulo.entity.ts      # (opcional) Entidad de referencia
```

### 3.5 Patrón de DTOs (Validación)

```typescript
// create-product.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsEnum, 
         IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class CreateFlavorDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() sku?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsInt() @Min(0) stockQuantity: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
}

class CreateSizeDto {
  @IsString() @IsNotEmpty() size: string;
  @IsInt() @Min(0) stockQuantity: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
}

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsString() @IsNotEmpty() sku: string;
  @IsString() @IsNotEmpty() description: string;
  
  @IsInt() @IsOptional() @Min(0) price?: number;
  @IsInt() @IsOptional() @Min(0) stockQuantity?: number;
  @IsString() @IsOptional() imageUrl?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsBoolean() @IsOptional() isFeatured?: boolean;
  @IsInt() @IsOptional() categoryId?: number;
  
  @IsEnum(ProductType) @IsOptional() productType?: ProductType;
  @IsEnum(Gender) @IsOptional() gender?: Gender;
  @IsBoolean() @IsOptional() requiresAvailabilityCheck?: boolean;
  
  // Descuentos por producto
  @IsInt() @IsOptional() @Min(0) @Max(100) discountPercent?: number;
  @IsString() @IsOptional() discountStartDate?: string;
  @IsString() @IsOptional() discountEndDate?: string;
  
  // Descuento por cantidad
  @IsInt() @IsOptional() @Min(1) minQuantityDiscount?: number;
  @IsInt() @IsOptional() @Min(1) @Max(100) quantityDiscountPercent?: number;
  
  // Variantes
  @IsArray() @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFlavorDto)
  flavors?: CreateFlavorDto[];
  
  @IsArray() @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSizeDto)
  sizes?: CreateSizeDto[];
}
```

### 3.6 Patrón de Controlador

```typescript
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Rutas PÚBLICAS (sin autenticación)
  @Public()
  @Get()
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // Rutas PROTEGIDAS (solo ADMIN)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);  // Soft delete
  }
}
```

### 3.7 Patrón de Servicio

```typescript
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Queries siempre filtran soft deletes: { deletedAt: null }
  async findAll(query: any) {
    const where: any = { deletedAt: null, isActive: true };
    
    if (query.featured === 'true') where.isFeatured = true;
    if (query.type) where.productType = query.type;
    if (query.gender) where.gender = query.gender;
    if (query.categoryId) where.categoryId = parseInt(query.categoryId);

    return this.prisma.product.findMany({
      where,
      include: { category: true, flavors: true, sizes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Soft delete: nunca se borra de la BD
  async remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

### 3.8 Módulo Prisma (Global)

```typescript
// prisma.module.ts
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    super({ adapter: new PrismaPg(pool) });
  }
}
```

---

## 4. Frontend — Next.js

### 4.1 Dependencias Exactas

```json
{
  "dependencies": {
    "next": "16.0.10",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-navigation-menu": "^1.2.5",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-sheet": "^1.0.0",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    
    "@hookform/resolvers": "^3.10.0",
    "@tanstack/react-table": "^8.21.3",
    "@vercel/analytics": "1.3.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "lucide-react": "^0.454.0",
    "motion": "^12.24.7",
    "next-themes": "^0.4.6",
    "react-hook-form": "^7.60.0",
    "recharts": "2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^3.3.1",
    "tailwindcss": "^4.1.9",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^1.1.2",
    "zod": "3.25.76"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.9",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8.5",
    "tw-animate-css": "1.3.3",
    "typescript": "^5"
  }
}
```

### 4.2 Configuración Next.js (`next.config.mjs`)

```javascript
const nextConfig = {
  output: 'standalone',  // Para Docker (produce server.js independiente)
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },   // Cualquier imagen HTTPS
      { protocol: 'http', hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
}
```

### 4.3 Configuración shadcn/ui (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 4.4 Patrón de API Calls (`lib/api/`)

Todas las funciones de API siguen este patrón:

```typescript
// lib/api/product.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- FUNCIONES PÚBLICAS (sin credentials) ---
export async function getProducts(options?: {
  featured?: boolean;
  type?: string;
  gender?: string;
  categoryId?: number;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options?.featured) params.set('featured', 'true');
  if (options?.type) params.set('type', options.type);
  if (options?.gender) params.set('gender', options.gender);
  if (options?.categoryId) params.set('categoryId', options.categoryId.toString());

  const res = await fetch(`${API_URL}/products?${params}`, {
    next: { revalidate: 60 },  // ISR: revalidar cada 60 segundos
  });
  if (!res.ok) throw new Error('Error fetching products');
  return res.json();
}

// --- FUNCIONES PROTEGIDAS (con credentials para cookies) ---
export async function createProduct(data: CreateProductDto): Promise<Product> {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // CRÍTICO: envía las cookies de autenticación
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error creating product');
  }
  return res.json();
}
```

### 4.5 Tipos TypeScript (`lib/types/index.ts`)

```typescript
// --- Enums (deben coincidir con Prisma) ---
export type ProductType = 'SUPPLEMENT' | 'APPAREL' | 'ACCESSORY';
export type Gender = 'MALE' | 'FEMALE' | 'UNISEX';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED';

// --- Producto ---
export interface ProductFlavor {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductSize {
  id: string;
  productId: string;
  size: string;
  stockQuantity: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId?: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price?: number;
  stockQuantity?: number;
  imageUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  productType: ProductType;
  gender?: Gender;
  requiresAvailabilityCheck?: boolean;
  discountPercent?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  minQuantityDiscount?: number;
  quantityDiscountPercent?: number;
  category?: Category;
  flavors?: ProductFlavor[];
  sizes?: ProductSize[];
}

// --- Pedido ---
export interface OrderItem {
  id?: string;
  productId: string;
  flavorId?: string;
  productName: string;
  flavorName?: string;
  quantity: number;
  unitPrice: number;
}

export interface GuestCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  customerNotes?: string;
  trackingCode?: string;
  courierName?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  guestCustomer?: GuestCustomer;
  items: OrderItem[];
}

export interface CreateOrderDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
  customerNotes?: string;
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
}

// --- Código de descuento ---
export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  discountPercent: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usageCount: number;
  minOrderAmount?: number;
}

export interface ValidateDiscountCodeResponse {
  valid: boolean;
  code: string;
  discountPercent: number;
  description?: string;
}

// --- Categoría ---
export interface Category {
  id: number;
  name: string;
  description?: string;
}
```

### 4.6 Carrito de Compras (React Context)

```typescript
// context/cart-context.tsx
"use client"

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string, flavorId?: string) => void;
  updateQuantity: (productId: string, quantity: number, flavorId?: string) => void;
  clearCart: () => void;
  totalItems: number;      // Cantidad total de items
  totalPrice: number;      // Precio total
  isOpen: boolean;         // Si el sidebar está abierto
  setIsOpen: (open: boolean) => void;
  justAdded: string | null; // Para animación de "recién agregado"
}
```

**Decisiones clave del carrito:**
- **sessionStorage** (no localStorage): el carrito se limpia al cerrar la pestaña
- **Soporte para variantes**: identifica items por `productId + flavorId`
- **Hidratación segura**: espera `isHydrated` antes de persistir para evitar mismatch SSR
- El `CartProvider` envuelve toda la app en el root layout

### 4.7 Integración WhatsApp (`lib/whatsapp.ts`)

```typescript
// Genera mensaje formateado para WhatsApp con datos del pedido
export function generateWhatsAppMessage(
  items: CartItem[], 
  total: number, 
  customer: CustomerData
): string {
  // Formato:
  // *PEDIDO [NOMBRE_TIENDA]* #ORDER_ID
  // 2x Producto - $Precio
  // Descuento: CODIGO (-X%)
  // *Total: $Total*
  // ---
  // *Nombre* | Teléfono
  // DNI: 12345678
  // Dirección
  // _Notas_
}

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

// Para consultas de disponibilidad (indumentaria)
export function generateAvailabilityMessage(data: AvailabilityData): string;
export function createAvailabilityWhatsAppUrl(phoneNumber: string, data: AvailabilityData): string;
```

### 4.8 Root Layout (`app/layout.tsx`)

El root layout es crítico. Incluye:

1. **Google Fonts** (Geist Sans + Geist Mono via `next/font`)
2. **CartProvider** envolviendo `{children}`
3. **Metadata completa**: title template, description, keywords, OpenGraph, Twitter Cards
4. **JSON-LD** estructurado: WebSite, LocalBusiness, Organization
5. **Links PWA**: manifest, apple-touch-icon
6. **Skip link** de accesibilidad
7. **Vercel Analytics** (opcional)

---

## 5. Base de Datos — Prisma + PostgreSQL

### 5.1 Esquema Completo

El esquema se diseñó con estos principios:

- **UUIDs** para IDs de seguridad (excepto Category que usa autoincrement)
- **Soft deletes** con `deletedAt` en modelos principales
- **Precios como enteros** (sin decimales, en la unidad más pequeña)
- **Datos congelados** en OrderItem (productName, flavorName, unitPrice se guardan al momento de la compra)
- **Variantes de producto**: ProductFlavor (para suplementos/sabores) y ProductSize (para indumentaria/talles)
- **Enums nativos** de PostgreSQL con `@@map()` para snake_case en BD

### 5.2 Enums (Adaptables al Rubro)

```prisma
enum ProductType {
  // Adaptar al rubro. Ejemplos:
  // Fitness: SUPPLEMENT, APPAREL, ACCESSORY
  // Comida: PIZZA, EMPANADA, BEBIDA
  // Ropa: REMERA, PANTALON, CAMPERA
  TIPO_1
  TIPO_2
  TIPO_3
  @@map("product_type")
}

enum Gender {
  MALE
  FEMALE
  UNISEX
  @@map("gender")
}

enum OrderStatus {
  PENDING     // Pedido recibido, esperando confirmación de pago
  CONFIRMED   // Pago confirmado por admin
  SHIPPED     // Enviado con tracking
  CANCELLED   // Cancelado
  @@map("order_status")
}

enum Role {
  ADMIN
  CUSTOMER
  @@map("user_role")
}
```

### 5.3 Modelo de Datos (Relaciones)

```
User ──────────┐
               │ 1:N
GuestCustomer ─┤──── Order ──── OrderItem ──── Product
               │      │                         │
               │      └── status, tracking       ├── ProductFlavor
               │                                 ├── ProductSize
               │                                 ├── PriceHistory
               └                                 └── Category
                                                      
DiscountCode (independiente, se valida al checkout)
```

### 5.4 Script de Seed (`prisma/seed-admin.ts`)

Crea el usuario administrador inicial:

```typescript
const adminData = {
  email: 'admin@tutienda.com',
  password: 'CambiarEnProduccion123!',
  firstName: 'Admin',
  lastName: 'Tienda',
  phone: '+54000000000',
};

// Hash con bcrypt (10 rounds)
const hashedPassword = await bcrypt.hash(adminData.password, 10);

await prisma.user.create({
  data: {
    ...adminData,
    passwordHash: hashedPassword,
    role: 'ADMIN',
    isActive: true,
  },
});
```

Ejecutar con: `npm run seed:admin` (script: `ts-node prisma/seed-admin.ts`)

### 5.5 Migraciones

```bash
# Crear migración
npx prisma migrate dev --name nombre_descriptivo

# Aplicar en producción
npx prisma migrate deploy

# Generar cliente
npx prisma generate
```

---

## 6. Autenticación y Seguridad

### 6.1 Flujo de Autenticación

```
1. POST /auth/login { email, password }
   ↓
2. Backend valida credenciales con bcrypt
   ↓
3. Genera JWT (access_token: 7 días, refresh_token: 30 días)
   ↓
4. Setea cookies httpOnly en la respuesta
   Cookie: access_token=jwt...; HttpOnly; Secure; SameSite=Lax; Path=/
   Cookie: refresh_token=jwt...; HttpOnly; Secure; SameSite=Lax; Path=/
   ↓
5. Frontend hace requests con credentials: 'include'
   → Los cookies se envían automáticamente
   ↓
6. JwtAuthGuard extrae token de cookies (o header Authorization como fallback)
   → jwt.strategy.ts valida y retorna { id, email, role }
```

### 6.2 Configuración de Cookies (Producción)

La configuración de cookies maneja automáticamente:

- **Same domain**: `sameSite: 'lax'`, sin domain explícito
- **Subdominios** (ej: `api.tienda.com` + `tienda.com`): `sameSite: 'lax'`, `domain: '.tienda.com'`
- **TLDs de segundo nivel** (ej: `.com.ar`): detecta automáticamente y setea `domain: '.tienda.com.ar'`
- **Cross-domain** (dominios completamente diferentes): `sameSite: 'none'`, `secure: true`

### 6.3 Guards Globales

```
Petición HTTP
  ↓
ThrottlerGuard (100 req/min por IP)
  ↓
JwtAuthGuard
  ├── ¿Tiene @Public()? → SKIP (continuar sin auth)
  └── ¿Token válido? → Agrega user al request
  ↓
RolesGuard
  ├── ¿Tiene @Roles()? → Verifica que user.role coincida
  └── ¿Sin @Roles()? → SKIP (cualquier usuario autenticado)
  ↓
Controller
```

### 6.4 Seguridad Implementada

| Capa | Implementación |
|------|----------------|
| Headers HTTP | Helmet (CSP, X-Content-Type-Options, etc.) |
| Rate Limiting | @nestjs/throttler (100 req/min) |
| CORS | Origen específico + credentials |
| Autenticación | JWT en httpOnly cookies |
| Autorización | Role-based (ADMIN/CUSTOMER) |
| Validación | class-validator en todos los DTOs |
| Passwords | bcrypt (10 rounds) |
| Soft Deletes | Nunca se borran datos de la BD |

---

## 7. API — Contratos y Endpoints

### 7.1 Endpoints Públicos (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/products` | Listar productos (query: `featured`, `type`, `gender`, `categoryId`) |
| `GET` | `/products/:id` | Producto por ID |
| `GET` | `/products/slug/:slug` | Producto por slug |
| `GET` | `/categories` | Listar categorías |
| `GET` | `/categories/:id` | Categoría por ID |
| `POST` | `/orders` | Crear pedido (checkout) |
| `GET` | `/orders/track/:id` | Tracking público (datos sanitizados) |
| `POST` | `/discount-codes/validate` | Validar código de descuento |
| `POST` | `/auth/login` | Login admin |
| `POST` | `/auth/refresh` | Renovar access token |
| `GET` | `/auth/check` | Verificar si hay sesión activa |

### 7.2 Endpoints Protegidos (ADMIN)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/products` | Crear producto |
| `PATCH` | `/products/:id` | Actualizar producto |
| `DELETE` | `/products/:id` | Soft delete producto |
| `PATCH` | `/products/:id/restore` | Restaurar producto |
| `GET` | `/products/admin/deleted` | Listar eliminados |
| `POST` | `/products/bulk-price-update` | Actualizar precios masivamente |
| `GET` | `/products/:id/price-history` | Historial de precios |
| `POST` | `/categories` | Crear categoría |
| `PATCH` | `/categories/:id` | Actualizar categoría |
| `DELETE` | `/categories/:id` | Soft delete categoría |
| `GET` | `/orders` | Listar pedidos (query: `status`) |
| `GET` | `/orders/:id` | Detalle de pedido |
| `GET` | `/orders/stats` | Estadísticas |
| `PATCH` | `/orders/:id/status` | Cambiar estado + reducir stock |
| `PATCH` | `/orders/:id/tracking` | Agregar tracking → marca SHIPPED |
| `POST` | `/discount-codes` | Crear código |
| `GET` | `/discount-codes` | Listar códigos |
| `PATCH` | `/discount-codes/:id` | Actualizar código |
| `DELETE` | `/discount-codes/:id` | Eliminar código |
| `POST` | `/auth/logout` | Cerrar sesión |
| `GET` | `/auth/me` | Perfil del admin |

---

## 8. Flujos de Negocio

### 8.1 Flujo de Compra (Cliente)

```
1. Cliente navega el catálogo (/, /productos, /suplementos, etc.)
   ↓
2. Agrega productos al carrito (cart-sidebar.tsx)
   - Selecciona sabor/variante si aplica
   - Ajusta cantidad
   ↓
3. Abre el carrito → Puede aplicar código de descuento
   - POST /discount-codes/validate → valida y muestra descuento
   ↓
4. Click "Finalizar Compra" → checkout-form.tsx
   - Completa: nombre, apellido, email, teléfono, DNI
   - Dirección: calle, depto, provincia (dropdown GeoRef), localidad (dropdown GeoRef)
   - Notas opcionales
   ↓
5. "Confirmar Pedido"
   - POST /orders → crea GuestCustomer + Order + OrderItems en transacción
   - Retorna: { id, status: 'PENDING', trackingUrl }
   ↓
6. Se genera mensaje WhatsApp y se abre wa.me/NUMERO
   - Mensaje formateado con: pedido, productos, cliente, dirección, descuento
   ↓
7. Cliente envía mensaje por WhatsApp
   - Acuerda forma de pago con el negocio (transferencia, etc.)
   ↓
8. Pantalla de éxito con link de seguimiento: /pedido/[id]
```

### 8.2 Flujo de Gestión (Admin)

```
1. Admin accede a /dashboard/login → POST /auth/login
   ↓
2. Dashboard: ve pedidos, productos, estadísticas
   ↓
3. CONFIRMAR PEDIDO (tras verificar pago):
   - PATCH /orders/:id/status { status: 'CONFIRMED' }
   - En transacción: reduce stock de cada item (producto o sabor)
   - Envía email de confirmación al cliente (Resend)
   ↓
4. ENVIAR PEDIDO (tras despachar):
   - PATCH /orders/:id/tracking { trackingCode, courierName }
   - Cambia status a SHIPPED automáticamente
   - Envía email con tracking al cliente
   ↓
5. Cliente recibe emails y puede ver estado en /pedido/[id]
```

### 8.3 Gestión de Stock

- **Stock por producto base**: para productos simples
- **Stock por sabor/variante**: para productos con flavors
- **Stock por talle**: para indumentaria (ProductSize)
- **Se reduce al CONFIRMAR** (no al crear pedido): evita reducir stock de pedidos no pagados
- **requiresAvailabilityCheck**: para productos sin stock fijo (indumentaria bajo demanda), el cliente consulta por WhatsApp

### 8.4 Sistema de Descuentos

Hay dos niveles de descuento:

1. **Por producto**: `discountPercent` con fechas de inicio/fin
2. **Por cantidad**: `minQuantityDiscount` + `quantityDiscountPercent` (ej: "2+ unidades = 10% off")
3. **Por código**: `DiscountCode` que aplica al total del carrito

### 8.5 Historial de Precios

Cuando se actualiza el precio de un producto (individual o masivo):

```typescript
await tx.priceHistory.create({
  data: {
    productId: product.id,
    oldPrice: product.price,
    newPrice: calculatedNewPrice,
    changePercent: ((calculatedNewPrice - product.price) / product.price) * 100,
    reason: dto.reason || `Actualización masiva ${dto.percentChange}%`,
  },
});
```

---

## 9. UI/UX — Sistema de Diseño

### 9.1 Colores (OKLCH)

El sistema de colores usa OKLCH para mejor uniformidad perceptual. Adaptar los valores a la marca:

```css
/* globals.css — Colores de marca (ADAPTAR) */
:root {
  --brand-primary: oklch(0.75 0.2 145);       /* Color primario */
  --brand-primary-glow: oklch(0.8 0.25 145);  /* Glow del primario */
  --brand-dark: oklch(0.08 0 0);              /* Fondo oscuro */
}
```

### 9.2 Componentes shadcn/ui Utilizados

Instalar con `npx shadcn@latest add [componente]`:

```
button input textarea select checkbox switch radio-group slider
card separator sheet sidebar resizable
dialog alert-dialog popover hover-card tooltip drawer
navigation-menu menubar breadcrumb tabs pagination
toast toaster sonner alert progress skeleton spinner
table badge avatar chart carousel accordion
command context-menu dropdown-menu toggle toggle-group
form field label scroll-area collapsible calendar empty
```

### 9.3 Animaciones Personalizadas

```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 15px var(--brand-primary), 0 0 30px var(--brand-primary); }
  50% { box-shadow: 0 0 25px var(--brand-primary), 0 0 50px var(--brand-primary); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes cart-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

### 9.4 Responsive Design

- **Mobile-first** con breakpoints de Tailwind (sm, md, lg, xl)
- **Grid de productos**: 1 col mobile → 2 tablet → 3 desktop → 4 xl
- **Header**: hamburger en mobile, nav completo en desktop
- **Sidebar del carrito**: Sheet de shadcn/ui (slide-in)
- **Dashboard**: sidebar colapsable en mobile

### 9.5 Tipografía

```typescript
// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
```

### 9.6 Dashboard (Tema Claro)

El dashboard usa un override de tema claro con `dashboard.css`:
- Fondo blanco en lugar del tema oscuro del sitio público
- Sidebar con navegación por secciones
- DataTables con TanStack Table (search, sort, pagination, tabs)
- Diálogos modales para crear/editar/eliminar

---

## 10. SEO y PWA

### 10.1 Metadata (Root Layout)

```typescript
export const metadata: Metadata = {
  title: {
    default: "NOMBRE_TIENDA | Descripción Corta",
    template: "%s | NOMBRE_TIENDA",
  },
  description: "Descripción SEO de la tienda...",
  keywords: ["keyword1", "keyword2", "keyword3"],
  authors: [{ name: "NOMBRE_TIENDA" }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "NOMBRE_TIENDA",
    title: "...",
    description: "...",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};
```

### 10.2 JSON-LD Estructurado

En el root layout, incluir:

1. **WebSite** con SearchAction
2. **LocalBusiness** o **Organization** con dirección, horarios, teléfono, coordenadas
3. **BreadcrumbList** en páginas de producto
4. **Product** en páginas de detalle de producto
5. **CollectionPage** en páginas de categoría

### 10.3 Sitemap Dinámico (`app/sitemap.ts`)

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), priority: 1.0 },
    { url: `${SITE_URL}/productos`, priority: 0.9 },
    // ... más páginas estáticas
  ];
  
  const productPages = products.map((p) => ({
    url: `${SITE_URL}/productos/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    priority: 0.8,
  }));
  
  return [...staticPages, ...productPages];
}
```

### 10.4 PWA Manifest

```json
{
  "name": "NOMBRE TIENDA - Descripción",
  "short_name": "TIENDA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#00ff7f",
  "orientation": "portrait-primary",
  "categories": ["shopping"],
  "lang": "es-AR",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

## 11. Emails Transaccionales

### 11.1 Servicio de Email (Resend)

```typescript
// email.service.ts — Módulo GLOBAL
@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly fromEmail: string;
  private readonly storeName = 'NOMBRE_TIENDA';
  private readonly brandColor = '#10b981'; // Color de marca
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  }

  // Envía email de confirmación de pedido
  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean>;
  
  // Envía email con código de seguimiento
  async sendTrackingUpdate(data: OrderEmailData): Promise<boolean>;
}
```

### 11.2 Templates de Email

Los emails son HTML inline con estilos (no usar CSS externo para compatibilidad con clientes de email):

- **Header**: Logo/nombre de la tienda sobre fondo oscuro
- **Status pill**: Badge de estado (confirmado/enviado)
- **Items table**: Lista de productos con cantidades y precios
- **Total**: Monto total destacado
- **Info card**: Dirección de envío
- **CTA button**: "Ver mi Pedido" o "Seguir envío"
- **Footer**: WhatsApp de contacto + disclaimer legal

### 11.3 Cuándo se Envían

| Evento | Email | Trigger |
|--------|-------|---------|
| Pago confirmado | Confirmación de pedido | `PATCH /orders/:id/status { status: 'CONFIRMED' }` |
| Pedido enviado | Código de tracking | `PATCH /orders/:id/tracking { trackingCode }` |

> Los emails NO fallan la operación principal. Si Resend falla, se loguea el error pero el pedido se actualiza igual.

---

## 12. Despliegue — Docker + Producción

### 12.1 Dockerfile Backend

```dockerfile
FROM node:22.12.0-alpine

RUN apk -U add openssl

WORKDIR /app

COPY . .

# Instalar dependencias (incluye devDependencies para build)
RUN npm install --include=dev

# Generar Prisma Client
RUN npx prisma generate

# Build de NestJS
RUN npm run build

EXPOSE 3080

CMD ["node", "dist/src/main.js"]
```

### 12.2 Dockerfile Frontend (Multi-stage)

```dockerfile
# --- Etapa de build ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# --- Etapa de producción ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos del build (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 12.3 Plataforma de Despliegue

El proyecto original usa **Dokploy** (self-hosted) en un VPS. Alternativas compatibles:

| Plataforma | Frontend | Backend | Base de datos |
|------------|----------|---------|---------------|
| Dokploy (VPS) | Docker | Docker | PostgreSQL Docker |
| Railway | Docker | Docker | PostgreSQL managed |
| Render | Docker | Docker | PostgreSQL managed |
| DigitalOcean App | Docker | Docker | Managed DB |
| Vercel + Railway | Vercel (nativo) | Railway Docker | Railway PostgreSQL |

### 12.4 Dominios Recomendados

```
Frontend: tutienda.com (o www.tutienda.com)
Backend:  api.tutienda.com (subdominio)
```

> Si ambos están en subdominios del mismo dominio base, las cookies funcionan con `sameSite: 'lax'` y `domain: '.tutienda.com'`.

### 12.5 Checklist de Deploy

1. **PostgreSQL**: crear base de datos
2. **Backend**:
   - Configurar variables de entorno (ver sección 15)
   - Ejecutar `npx prisma migrate deploy`
   - Ejecutar `npm run seed:admin`
   - Verificar CORS apunta al frontend correcto
3. **Frontend**:
   - Configurar `NEXT_PUBLIC_API_URL` apuntando al backend
   - Configurar `NEXT_PUBLIC_SITE_URL` para SEO
4. **DNS**: Configurar dominios con SSL
5. **Verificar**:
   - Login admin funciona
   - Cookies se setean correctamente
   - CORS permite las peticiones
   - Imágenes se cargan

---

## 13. Paso a Paso para Replicar

### Fase 1: Setup Inicial

```bash
# 1. Crear estructura de carpetas
mkdir MiTienda && cd MiTienda

# 2. Crear backend
npx @nestjs/cli new Back --package-manager npm --language TypeScript --strict
cd Back
npm install @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/throttler @prisma/client @prisma/adapter-pg bcrypt class-transformer class-validator cookie-parser helmet passport passport-jwt resend rxjs
npm install -D prisma @types/bcrypt @types/cookie-parser @types/express @types/passport-jwt ts-node
npx prisma init
cd ..

# 3. Crear frontend
npx create-next-app@latest Front --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd Front
# Inicializar shadcn/ui
npx shadcn@latest init
# Instalar dependencias adicionales
npm install @hookform/resolvers @tanstack/react-table react-hook-form zod date-fns sonner next-themes motion lucide-react recharts embla-carousel-react vaul cmdk
cd ..
```

### Fase 2: Backend (en orden)

1. **Prisma**: Crear `schema.prisma` con todos los modelos (adaptar enums al rubro)
2. **PrismaModule**: módulo global con PrismaService
3. **AuthModule**: JWT strategy, guards, decorators, controller, service
4. **EmailModule**: módulo global con EmailService (Resend)
5. **CategoriesModule**: CRUD con soft delete
6. **ProductsModule**: CRUD con variantes, historial de precios, bulk update
7. **OrdersModule**: Crear pedido, gestionar estados, reducir stock, emails
8. **DiscountCodesModule**: CRUD + validación
9. **main.ts**: Helmet, CORS, ValidationPipe, cookieParser
10. **app.module.ts**: Imports + guards globales
11. **seed-admin.ts**: Script para crear admin
12. **Dockerfile**: Build y producción

### Fase 3: Frontend (en orden)

1. **Configurar**: `next.config.mjs`, `components.json`, `postcss.config.mjs`
2. **globals.css**: Variables CSS, colores de marca, animaciones
3. **lib/types**: Todas las interfaces TypeScript
4. **lib/api/**: Funciones de API (auth, product, category, order, discount-code)
5. **lib/whatsapp.ts**: Generación de mensajes WhatsApp
6. **context/cart-context.tsx**: Estado global del carrito
7. **components/ui/**: Instalar componentes shadcn/ui necesarios
8. **components/**: Header, Footer, CartSidebar, CheckoutForm, HeroSection
9. **app/layout.tsx**: Root layout con metadata, providers, JSON-LD
10. **app/(main)/**: Landing page
11. **app/productos/**: Catálogo + detalle de producto
12. **app/[tipo]/**: Páginas por tipo de producto
13. **app/pedido/[id]**: Tracking público
14. **app/dashboard/**: Panel de administración completo
15. **app/sitemap.ts** + **app/robots.ts**: SEO
16. **public/**: Manifest PWA, iconos, assets
17. **Dockerfile**: Multi-stage build

### Fase 4: Integración y Testing

1. Verificar flujo completo: navegar → agregar al carrito → checkout → WhatsApp → confirmar pago → email → tracking
2. Verificar dashboard: login → crear productos → gestionar pedidos
3. Verificar responsive en mobile
4. Verificar SEO: metadata, JSON-LD, sitemap

---

## 14. Decisiones de Arquitectura y Por Qué

### ¿Por qué checkout por WhatsApp y no pasarela de pago?

- **Sin comisiones**: no se paga por cada transacción
- **Confianza directa**: el cliente habla con el negocio
- **Flexibilidad de pago**: transferencia, efectivo, etc.
- **Simplicidad**: no requiere integración con MercadoPago/Stripe
- **Ideal para PYMES**: bajo volumen donde el contacto personal es valioso

### ¿Por qué cookies httpOnly y no localStorage para JWT?

- **Seguridad**: los cookies httpOnly no son accesibles desde JavaScript (protección contra XSS)
- **Automático**: el browser envía cookies automáticamente (no hay que manejar headers manualmente)
- **Refresh transparente**: el refresh token viaja automáticamente

### ¿Por qué soft delete y no delete real?

- **Auditoría**: siempre se puede ver qué se eliminó y cuándo
- **Recuperación**: se pueden restaurar registros accidentalmente eliminados
- **Integridad**: los OrderItems siguen referenciando productos eliminados

### ¿Por qué precios como enteros?

- **Precisión**: evita errores de punto flotante (`0.1 + 0.2 ≠ 0.3`)
- **Rendimiento**: operaciones con enteros son más rápidas
- **Estándar**: es la práctica recomendada en e-commerce (Stripe, MercadoPago, etc.)

### ¿Por qué sessionStorage y no localStorage para el carrito?

- **Limpieza automática**: al cerrar la pestaña se limpia (evita carritos fantasma)
- **Privacidad**: no persiste datos entre sesiones
- **Simpleza**: sin necesidad de manejar expiración

### ¿Por qué React Context y no Zustand/Redux?

- **Suficiente**: para un carrito de compras, Context + useState es suficiente
- **Sin dependencias extra**: viene con React
- **Simplicidad**: menos boilerplate, más fácil de entender

### ¿Por qué GeoRef Argentina para direcciones?

- **Datos oficiales**: API del gobierno argentino
- **Gratis**: sin costo ni límites significativos
- **Provincias + Localidades**: dropdown encadenado para mejor UX
- **Adaptable**: reemplazar por la API de geo del país correspondiente

### ¿Por qué Resend para emails?

- **Gratis**: 3,000 emails/mes en plan free
- **Simple API**: una sola función para enviar
- **Deliverability**: buena tasa de entrega
- **HTML templates**: soporte nativo

### ¿Por qué datos congelados en OrderItem?

- **Integridad**: si el producto cambia de nombre/precio, el pedido histórico no se altera
- **Auditoría**: se puede ver exactamente qué compró el cliente y a qué precio
- **Independencia**: los items del pedido no dependen del estado actual del producto

---

## 15. Variables de Entorno

### Backend (`Back/.env`)

```bash
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@host:5432/nombre_db"

# JWT - Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="CAMBIAR_POR_UN_SECRETO_SEGURO_DE_64_CARACTERES_MINIMO"

# URL del frontend (para CORS y cookies)
FRONTEND_URL="https://tutienda.com"

# Puerto del servidor
PORT=3080

# Entorno
NODE_ENV="production"

# Email (Resend) - https://resend.com/api-keys
RESEND_API_KEY="re_xxxxxxxxxx"
EMAIL_FROM="noreply@tutienda.com"
```

### Frontend (`Front/.env.local`)

```bash
# URL de la API backend
NEXT_PUBLIC_API_URL="https://api.tutienda.com"

# URL del sitio (para SEO, sitemap, OpenGraph)
NEXT_PUBLIC_SITE_URL="https://tutienda.com"
```

> **NOTA**: Las variables `NEXT_PUBLIC_` son accesibles desde el cliente. Si cambiás estas variables, necesitás hacer rebuild.

---

## 16. Checklist Final

### Backend
- [ ] PostgreSQL funcionando
- [ ] `schema.prisma` con todos los modelos adaptados al rubro
- [ ] Migraciones ejecutadas (`npx prisma migrate deploy`)
- [ ] Admin seed ejecutado (`npm run seed:admin`)
- [ ] Todos los módulos creados (auth, products, categories, orders, discount-codes, email)
- [ ] Guards globales configurados (throttler, jwt, roles)
- [ ] CORS apunta al frontend correcto
- [ ] Helmet configurado
- [ ] ValidationPipe global
- [ ] Cookie parser habilitado
- [ ] Variables de entorno configuradas
- [ ] Dockerfile funcional
- [ ] Health check endpoint (`GET /`)

### Frontend
- [ ] `next.config.mjs` con output standalone
- [ ] shadcn/ui inicializado con estilo new-york
- [ ] Variables CSS de marca en `globals.css`
- [ ] Todos los tipos en `lib/types/index.ts`
- [ ] Funciones API en `lib/api/`
- [ ] WhatsApp integration en `lib/whatsapp.ts`
- [ ] Cart context funcional con sessionStorage
- [ ] Root layout con metadata + JSON-LD + providers
- [ ] Landing page con hero + productos destacados
- [ ] Catálogo con filtros por tipo/categoría
- [ ] Detalle de producto con variantes
- [ ] Carrito sidebar con descuentos
- [ ] Checkout form con GeoRef (o equivalente)
- [ ] Tracking público de pedidos
- [ ] Dashboard completo (login, productos, categorías, pedidos, descuentos, precios)
- [ ] Sitemap dinámico
- [ ] robots.txt
- [ ] PWA manifest
- [ ] Dockerfile multi-stage funcional
- [ ] Responsive (mobile-first)
- [ ] Accesibilidad básica (ARIA, semántica, skip link)

### Integración
- [ ] Flujo completo funciona: navegar → carrito → checkout → WhatsApp → confirmar → email → tracking
- [ ] Login admin funciona con cookies
- [ ] CRUD productos desde dashboard
- [ ] Gestión de pedidos (estados + tracking)
- [ ] Códigos de descuento funcionan
- [ ] Emails se envían correctamente
- [ ] SEO: metadata dinámica en todas las páginas
- [ ] Imágenes optimizadas con Next.js Image

---

> **Este blueprint fue generado analizando el proyecto LUB ENERGY Store. Adaptá los nombres, colores, tipos de producto, y datos de contacto al nuevo negocio.**
