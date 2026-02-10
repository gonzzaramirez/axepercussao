import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DiscountCodesService } from './discount-codes.service';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('discount-codes')
export class DiscountCodesController {
  constructor(private readonly discountCodesService: DiscountCodesService) {}

  // --- Rutas PÚBLICAS ---

  @Public()
  @Post('validate')
  validate(@Body() dto: ValidateDiscountCodeDto) {
    return this.discountCodesService.validate(dto);
  }

  // --- Rutas ADMIN ---

  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.discountCodesService.findAll();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateDiscountCodeDto) {
    return this.discountCodesService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDiscountCodeDto) {
    return this.discountCodesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountCodesService.remove(id);
  }
}
