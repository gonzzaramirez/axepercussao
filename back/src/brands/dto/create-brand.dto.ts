import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

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

