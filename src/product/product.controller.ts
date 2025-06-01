'use server';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { ProductQuery } from './query/product-query';
import { updateProductDTO } from './dto/update-product.dto';
import { Public } from 'src/utils/decorators/public';

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

  @Put('/:id')
  async updateProduct(@Param('id') id: string, @Body() data: updateProductDTO) {
    return await this.productService.updateProduct(id, data.toUpdateEntity());
  }
}
