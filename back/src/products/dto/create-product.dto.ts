import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsInt()
  @IsOptional()
  brandId?: number;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  stockQuantity?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsEnum(['INSTRUMENT', 'ACCESSORY'])
  @IsOptional()
  productType?: string;

  @IsBoolean()
  @IsOptional()
  requiresAvailabilityCheck?: boolean;

  // Descuentos por producto
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsString()
  @IsOptional()
  discountStartDate?: string;

  @IsString()
  @IsOptional()
  discountEndDate?: string;

  // Descuento por cantidad
  @IsInt()
  @IsOptional()
  @Min(1)
  minQuantityDiscount?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  quantityDiscountPercent?: number;

  // Variantes
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
