import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Public } from 'src/utils/decorators/public';
import { CreateProductDto } from './dto/create-product.dto';
import { updateProductDTO } from './dto/update-product.dto';
import { ProductService } from './product.service';
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
  async updateProduct(
    @Param('id') id: string,
    @Body() data: updateProductDTO,
    @Request() req,
  ) {
    const product = await this.productService.getProduct(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.authorId !== req.user.id) {
      throw new ForbiddenException('You can only edit your own products');
    }
    return await this.productService.updateProduct(id, data.toUpdateEntity());
  }

  @Post('/:id/images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const productId = req.params.id;
          const uploadPath = join(
            process.cwd(),
            'uploads',
            'products',
            productId,
          );

          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadImages(
    @Param('id') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const product = await this.productService.getProduct(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.authorId !== req.user.id) {
      throw new ForbiddenException(
        'You can only upload images to your own products',
      );
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const imageKeys = files.map(
      (file) => `uploads/products/${productId}/${file.filename}`,
    );

    return await this.productService.addImages(productId, imageKeys);
  }

  @Delete('/:id/images/:imageId')
  async deleteImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @Request() req,
  ) {
    const product = await this.productService.getProduct(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.authorId !== req.user.id) {
      throw new ForbiddenException(
        'You can only delete images from your own products',
      );
    }

    const image = await this.productService.deleteImage(imageId, productId);

    const filePath = join(process.cwd(), image.key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return { message: 'Image deleted successfully' };
  }
}
