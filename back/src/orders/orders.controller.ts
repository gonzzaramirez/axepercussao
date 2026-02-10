import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  UpdateOrderStatusDto,
  UpdateOrderTrackingDto,
} from './dto/update-order.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // --- Rutas PÚBLICAS ---

  @Public()
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Public()
  @Get('track/:id')
  trackOrder(@Param('id') id: string) {
    return this.ordersService.trackOrder(id);
  }

  // --- Rutas ADMIN ---

  @Roles('ADMIN')
  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Roles('ADMIN')
  @Patch(':id/tracking')
  updateTracking(
    @Param('id') id: string,
    @Body() dto: UpdateOrderTrackingDto,
  ) {
    return this.ordersService.updateTracking(id, dto);
  }
}
