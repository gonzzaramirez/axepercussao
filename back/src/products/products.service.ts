import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkPriceUpdateDto } from './dto/bulk-price-update.dto';
import { ProductType, InstrumentRegister } from '@prisma/client';

function normalizeVariantToken(value?: string | null): string {
  if (!value) return 'na';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildVariantKey(input: {
  productId: string;
  brandId?: number | null;
  size?: string | null;
  model?: string | null;
  material?: string | null;
}) {
  return [
    input.productId,
    input.brandId ?? 'na',
    normalizeVariantToken(input.size),
    normalizeVariantToken(input.model),
    normalizeVariantToken(input.material),
  ].join('|');
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const where: any = { deletedAt: null };

    if (query.active !== 'false') {
      where.isActive = true;
    }
    if (query.featured === 'true') {
      where.isFeatured = true;
    }
    if (query.type) {
      where.productType = query.type;
    }
    if (query.register) {
      where.instrumentRegister = query.register;
    }
    if (query.categoryId) {
      where.categoryId = parseInt(query.categoryId);
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          ...(query.admin === 'true' ? {} : { where: { isActive: true } }),
          include: { brand: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        variants: {
          include: { brand: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto #${id} no encontrado`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null, isActive: true },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          include: { brand: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con slug "${slug}" no encontrado`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const {
      variants,
      discountStartDate,
      discountEndDate,
      productType,
      instrumentRegister,
      ...data
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...data,
          productType: (productType as ProductType) || 'INSTRUMENT',
          instrumentRegister: instrumentRegister
            ? (instrumentRegister as InstrumentRegister)
            : null,
          discountStartDate: discountStartDate
            ? new Date(discountStartDate)
            : undefined,
          discountEndDate: discountEndDate ? new Date(discountEndDate) : undefined,
        },
      });

      if (variants && variants.length > 0) {
        for (const v of variants) {
          await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: v.sku,
              brandId: v.brandId || null,
              variantKey: buildVariantKey({
                productId: product.id,
                brandId: v.brandId || null,
                size: v.size || null,
                model: v.model || null,
                material: v.material || null,
              }),
              size: v.size || null,
              model: v.model || null,
              material: v.material || null,
              price: v.price ?? null,
              stockQuantity: v.stockQuantity ?? 0,
              imageUrl: v.imageUrl || null,
              isActive: v.isActive ?? true,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          variants: { include: { brand: true }, orderBy: { createdAt: 'asc' } },
        },
      });
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const {
      variants,
      discountStartDate,
      discountEndDate,
      productType,
      instrumentRegister,
      ...data
    } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Actualizar el producto base
      await tx.product.update({
        where: { id },
        data: {
          ...data,
          // Manejar enums explícitamente
          ...(productType !== undefined
            ? { productType: productType as ProductType }
            : {}),
          ...(instrumentRegister !== undefined
            ? {
                instrumentRegister: instrumentRegister
                  ? (instrumentRegister as InstrumentRegister)
                  : null,
              }
            : {}),
          // Manejar fechas
          ...(discountStartDate !== undefined
            ? {
                discountStartDate: discountStartDate
                  ? new Date(discountStartDate)
                  : null,
              }
            : {}),
          ...(discountEndDate !== undefined
            ? {
                discountEndDate: discountEndDate
                  ? new Date(discountEndDate)
                  : null,
              }
            : {}),
        },
      });

      // 2. Gestión inteligente de variantes (upsert, no delete+recreate)
      if (variants !== undefined) {
        const existing = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true },
        });

        const existingIds = existing.map((v) => v.id);
        const submittedIds = new Set(
          variants.filter((v) => v.id).map((v) => v.id!),
        );

        // Desactivar variantes que el admin eliminó (soft delete, preserva refs de pedidos)
        const toDeactivate = existingIds.filter(
          (eid) => !submittedIds.has(eid),
        );
        if (toDeactivate.length > 0) {
          await tx.productVariant.updateMany({
            where: { id: { in: toDeactivate } },
            data: { isActive: false },
          });
        }

        // Procesar variantes enviadas
        for (const v of variants) {
          const variantKey = buildVariantKey({
            productId: id,
            brandId: v.brandId || null,
            size: v.size || null,
            model: v.model || null,
            material: v.material || null,
          });

          const variantData = {
            sku: v.sku,
            brandId: v.brandId || null,
            variantKey,
            size: v.size || null,
            model: v.model || null,
            material: v.material || null,
            price: v.price ?? null,
            stockQuantity: v.stockQuantity ?? 0,
            imageUrl: v.imageUrl || null,
            isActive: v.isActive ?? true,
          };

          if (v.id && existingIds.includes(v.id)) {
            // Actualizar variante existente
            await tx.productVariant.update({
              where: { id: v.id },
              data: variantData,
            });
          } else {
            // Crear nueva variante
            await tx.productVariant.create({
              data: {
                ...variantData,
                productId: id,
              },
            });
          }
        }
      }

      // 3. Retornar producto actualizado con variantes activas
      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          variants: {
            include: { brand: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async findDeleted() {
    return this.prisma.product.findMany({
      where: { deletedAt: { not: null } },
      include: { category: true },
      orderBy: { deletedAt: 'desc' },
    });
  }

  async bulkPriceUpdate(dto: BulkPriceUpdateDto) {
    const where: any = { deletedAt: null };

    if (dto.productType) {
      where.productType = dto.productType;
    }
    if (dto.productIds && dto.productIds.length > 0) {
      where.id = { in: dto.productIds };
    }

    const products = await this.prisma.product.findMany({
      where,
      select: { id: true, price: true },
    });

    const updates = products
      .filter((p) => p.price !== null && p.price !== undefined)
      .map((product) => {
        const oldPrice = product.price!;
        const newPrice = Math.round(
          oldPrice * (1 + dto.percentChange / 100),
        );

        return this.prisma.$transaction([
          this.prisma.product.update({
            where: { id: product.id },
            data: { price: newPrice },
          }),
          this.prisma.priceHistory.create({
            data: {
              productId: product.id,
              oldPrice,
              newPrice,
              changePercent: dto.percentChange,
              reason:
                dto.reason ||
                `Actualización masiva ${dto.percentChange > 0 ? '+' : ''}${dto.percentChange}%`,
            },
          }),
        ]);
      });

    await Promise.all(updates);

    return {
      message: `${updates.length} productos actualizados`,
      count: updates.length,
    };
  }

  async getPriceHistory(productId: string) {
    return this.prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
