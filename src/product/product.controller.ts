import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Public } from 'src/utils/decorators/public';
import { ProductQuery } from './query/product-query';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() data: CreateProductDto, @Request() req) {
    return await this.productService.createProduct(
      data.toCreateEntity(req.user.id),
    );
  }

  @Get()
  @Public()
  async listProducts(@Query() query: ProductQuery) {
    return await this.productService.listProducts(query);
  }

  @Get('/my-products')
  async listMyProducts(@Request() req, @Query() query: ProductQuery) {
    return await this.productService.listUserProducts(req.user.id, query);
  }

  @Get('/:id')
  @Public()
  async getProduct(@Param('id') id: string) {
    return await this.productService.getProduct(id);
  }
}
