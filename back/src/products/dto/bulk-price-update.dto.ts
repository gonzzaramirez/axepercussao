import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class BulkPriceUpdateDto {
  @IsNumber()
  percentChange: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsEnum(['PERCUSSION', 'ACCESSORY', 'SPARE_PART'])
  @IsOptional()
  productType?: string;

  @IsArray()
  @IsOptional()
  productIds?: string[];
}
