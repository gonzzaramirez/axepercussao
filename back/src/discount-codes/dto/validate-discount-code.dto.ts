import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class ValidateDiscountCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  orderAmount?: number;
}
