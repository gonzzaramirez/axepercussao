import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class UpdateDiscountCodeDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  validFrom?: string;

  @IsString()
  @IsOptional()
  validUntil?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;
}
