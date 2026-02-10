import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';

@Injectable()
export class DiscountCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const code = await this.prisma.discountCode.findUnique({
      where: { id },
    });

    if (!code) {
      throw new NotFoundException(`Código de descuento #${id} no encontrado`);
    }

    return code;
  }

  async create(dto: CreateDiscountCodeDto) {
    const { validFrom, validUntil, ...data } = dto;

    return this.prisma.discountCode.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateDiscountCodeDto) {
    await this.findOne(id);

    const { validFrom, validUntil, ...data } = dto;

    return this.prisma.discountCode.update({
      where: { id },
      data: {
        ...data,
        code: data.code?.toUpperCase(),
        validFrom: validFrom
          ? new Date(validFrom)
          : validFrom === null
            ? null
            : undefined,
        validUntil: validUntil
          ? new Date(validUntil)
          : validUntil === null
            ? null
            : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.discountCode.delete({ where: { id } });
  }

  async validate(dto: ValidateDiscountCodeDto) {
    const code = await this.prisma.discountCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!code) {
      throw new BadRequestException('Código de descuento no válido');
    }

    if (!code.isActive) {
      throw new BadRequestException('Este código está desactivado');
    }

    const now = new Date();

    if (code.validFrom && now < code.validFrom) {
      throw new BadRequestException('Este código aún no está vigente');
    }

    if (code.validUntil && now > code.validUntil) {
      throw new BadRequestException('Este código ha expirado');
    }

    if (code.usageLimit && code.usageCount >= code.usageLimit) {
      throw new BadRequestException(
        'Este código ha alcanzado su límite de uso',
      );
    }

    if (
      code.minOrderAmount &&
      dto.orderAmount &&
      dto.orderAmount < code.minOrderAmount
    ) {
      throw new BadRequestException(
        `El monto mínimo para usar este código es $${code.minOrderAmount.toLocaleString()}`,
      );
    }

    // Incrementar contador de uso
    await this.prisma.discountCode.update({
      where: { id: code.id },
      data: { usageCount: { increment: 1 } },
    });

    return {
      valid: true,
      code: code.code,
      discountPercent: code.discountPercent,
      description: code.description,
    };
  }
}
