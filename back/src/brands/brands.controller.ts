import { Controller, Get } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  findAll() {
    return this.brandsService.findAll();
  }
}
