import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkPriceUpdateDto } from './dto/bulk-price-update.dto';
import { ProductType } from '@prisma/client';

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
      include: { category: true, variants: { include: { brand: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true, variants: { include: { brand: true } } },
    });

    if (!product) {
      throw new NotFoundException(`Producto #${id} no encontrado`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null, isActive: true },
      include: { category: true, variants: { include: { brand: true } } },
    });

    if (!product) {
      throw new NotFoundException(`Producto con slug "${slug}" no encontrado`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const { variants, discountStartDate, discountEndDate, ...data } = dto;

    return this.prisma.product.create({
      data: {
        ...data,
        productType: (data.productType as ProductType) || 'INSTRUMENT',
        discountStartDate: discountStartDate
          ? new Date(discountStartDate)
          : undefined,
        discountEndDate: discountEndDate
          ? new Date(discountEndDate)
          : undefined,
        variants: variants
          ? {
              create: variants.map((v) => ({
                sku: v.sku,
                brandId: v.brandId,
                size: v.size,
                model: v.model,
                material: v.material,
                price: v.price,
                stockQuantity: v.stockQuantity ?? 0,
                imageUrl: v.imageUrl,
                isActive: v.isActive ?? true,
              })),
            }
          : undefined,
      },
      include: { category: true, variants: { include: { brand: true } } },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const {
      variants,
      discountStartDate,
      discountEndDate,
      ...data
    } = dto;

    // Si se envían variants, reemplazar todos
    if (variants) {
      await this.prisma.productVariant.deleteMany({
        where: { productId: id },
      });
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        productType: data.productType as ProductType | undefined,
        discountStartDate: discountStartDate
          ? new Date(discountStartDate)
          : discountStartDate === null
            ? null
            : undefined,
        discountEndDate: discountEndDate
          ? new Date(discountEndDate)
          : discountEndDate === null
            ? null
            : undefined,
        variants: variants
          ? {
              create: variants.map((v) => ({
                sku: v.sku,
                brandId: v.brandId,
                size: v.size,
                model: v.model,
                material: v.material,
                price: v.price,
                stockQuantity: v.stockQuantity ?? 0,
                imageUrl: v.imageUrl,
                isActive: v.isActive ?? true,
              })),
            }
          : undefined,
      },
      include: { category: true, variants: { include: { brand: true } } },
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
