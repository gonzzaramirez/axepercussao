import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { DiscountCodesModule } from './discount-codes/discount-codes.module';
import { BrandsModule } from './brands/brands.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    // Variables de entorno globales
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting: 100 req/min por IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Módulos de la aplicación
    PrismaModule,
    AuthModule,
    EmailModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    DiscountCodesModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards GLOBALES
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
