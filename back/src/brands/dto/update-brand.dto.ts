import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

// Versión "manual" sin PartialType para evitar depender de @nestjs/mapped-types
export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'logoUrl debe ser una URL válida' })
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'website debe ser una URL válida' })
  website?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


