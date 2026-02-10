import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  UpdateOrderStatusDto,
  UpdateOrderTrackingDto,
} from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(query: any) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        guestCustomer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        guestCustomer: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido #${id} no encontrado`);
    }

    return order;
  }

  async trackOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        guestCustomer: {
          select: {
            firstName: true,
            lastName: true,
            city: true,
            province: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido #${id} no encontrado`);
    }

    // Datos sanitizados para tracking público
    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      trackingCode: order.trackingCode,
      courierName: order.courierName,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      items: order.items.map((item) => ({
        productName: item.productName,
        brandName: item.brandName,
        variantDesc: item.variantDesc,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      customer: order.guestCustomer
        ? {
            name: `${order.guestCustomer.firstName} ${order.guestCustomer.lastName}`,
            city: order.guestCustomer.city,
            province: order.guestCustomer.province,
          }
        : null,
    };
  }

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear GuestCustomer
      const customer = await tx.guestCustomer.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          dni: dto.dni,
          street: dto.street,
          apartment: dto.apartment,
          city: dto.city,
          province: dto.province,
        },
      });

      // 2. Crear Order + OrderItems
      const order = await tx.order.create({
        data: {
          guestCustomerId: customer.id,
          totalAmount: dto.totalAmount,
          customerNotes: dto.customerNotes,
          discountCode: dto.discountCode,
          discountPercent: dto.discountPercent,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              brandName: item.brandName,
              variantDesc: item.variantDesc,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          guestCustomer: true,
          items: true,
        },
      });

      return order;
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const newStatus = dto.status as OrderStatus;

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: newStatus,
        adminNotes: dto.adminNotes || order.adminNotes,
      };

      if (newStatus === 'CONFIRMED') {
        updateData.confirmedAt = new Date();

        // Reducir stock de cada item
        for (const item of order.items) {
          if (item.variantId) {
            // Stock por variante
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });
          } else {
            // Stock por producto base
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });
          }
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData,
        include: { guestCustomer: true, items: true },
      });

      // Enviar email de confirmación
      if (newStatus === 'CONFIRMED' && updatedOrder.guestCustomer) {
        const customer = updatedOrder.guestCustomer;
        this.emailService
          .sendOrderConfirmation({
            orderId: updatedOrder.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerEmail: customer.email,
            items: updatedOrder.items.map((i) => ({
              productName: i.productName,
              brandName: i.brandName || undefined,
              variantDesc: i.variantDesc || undefined,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
            totalAmount: updatedOrder.totalAmount,
            address: `${customer.street}${customer.apartment ? `, ${customer.apartment}` : ''}, ${customer.city}, ${customer.province}`,
          })
          .catch((err) =>
            this.logger.error(`Error enviando email: ${err}`),
          );
      }

      return updatedOrder;
    });
  }

  async updateTracking(id: string, dto: UpdateOrderTrackingDto) {
    const order = await this.findOne(id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        trackingCode: dto.trackingCode,
        courierName: dto.courierName,
        status: 'SHIPPED',
        shippedAt: new Date(),
      },
      include: { guestCustomer: true, items: true },
    });

    // Enviar email de tracking
    if (updatedOrder.guestCustomer) {
      const customer = updatedOrder.guestCustomer;
      this.emailService
        .sendTrackingUpdate({
          orderId: updatedOrder.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          items: updatedOrder.items.map((i) => ({
            productName: i.productName,
            brandName: i.brandName || undefined,
            variantDesc: i.variantDesc || undefined,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          totalAmount: updatedOrder.totalAmount,
          trackingCode: dto.trackingCode,
          courierName: dto.courierName,
          address: `${customer.street}, ${customer.city}, ${customer.province}`,
        })
        .catch((err) =>
          this.logger.error(`Error enviando email de tracking: ${err}`),
        );
    }

    return updatedOrder;
  }

  async getStats() {
    const [total, pending, confirmed, shipped, cancelled, revenue] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.order.count({ where: { status: 'CONFIRMED' } }),
        this.prisma.order.count({ where: { status: 'SHIPPED' } }),
        this.prisma.order.count({ where: { status: 'CANCELLED' } }),
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { in: ['CONFIRMED', 'SHIPPED'] } },
        }),
      ]);

    return {
      total,
      pending,
      confirmed,
      shipped,
      cancelled,
      revenue: revenue._sum.totalAmount || 0,
    };
  }
}
