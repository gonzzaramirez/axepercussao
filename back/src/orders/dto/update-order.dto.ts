import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED'])
  status: string;

  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class UpdateOrderTrackingDto {
  @IsString()
  trackingCode: string;

  @IsString()
  @IsOptional()
  courierName?: string;
}
