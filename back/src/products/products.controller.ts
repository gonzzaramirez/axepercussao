import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkPriceUpdateDto } from './dto/bulk-price-update.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- Rutas PÚBLICAS ---

  @Public()
  @Get()
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // --- Rutas ADMIN ---

  @Roles('ADMIN')
  @Get('admin/deleted')
  findDeleted() {
    return this.productsService.findDeleted();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Roles('ADMIN')
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  @Roles('ADMIN')
  @Post('bulk-price-update')
  bulkPriceUpdate(@Body() dto: BulkPriceUpdateDto) {
    return this.productsService.bulkPriceUpdate(dto);
  }

  @Roles('ADMIN')
  @Get(':id/price-history')
  getPriceHistory(@Param('id') id: string) {
    return this.productsService.getPriceHistory(id);
  }
}
