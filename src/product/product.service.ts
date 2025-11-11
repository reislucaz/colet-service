import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pagination } from 'src/utils/pagination';
import { ProductQuery } from './query/product-query';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly productIncludeOptions = {
    category: {
      select: {
        id: true,
        name: true,
        iconKey: true,
      },
    },
    images: true,
    author: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  };

  private readonly categorySelectOptions = {
    id: true,
    name: true,
  };

  private readonly authorSelectOptions = {
    id: true,
    name: true,
    email: true,
  };

  private buildSearchWhereClause(search?: string): Prisma.ProductWhereInput {
    if (!search) {
      return {};
    }

    return {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  private calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  async createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: this.productIncludeOptions,
    });
  }

  async updateProduct(productId: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  async deleteProduct(productId: string) {
    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  async listProducts(query: ProductQuery): Promise<Pagination<Product>> {
    const { page, limit, search } = query;
    const skip = this.calculateSkip(page, limit);

    const where: Prisma.ProductWhereInput = this.buildSearchWhereClause(search);

    if (query.category) {
      where.categoryId = query.category;
    }

    if (query.userId) {
      where.authorId = query.userId;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        include: {
          category: {
            select: this.categorySelectOptions,
          },
          images: true,
          author: {
            select: this.authorSelectOptions,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return new Pagination(products, total, page, limit);
  }

  async listUserProducts(
    userId: string,
    query: ProductQuery,
  ): Promise<Pagination<Product>> {
    const { page, limit, search } = query;
    const skip = this.calculateSkip(page, limit);

    const where: Prisma.ProductWhereInput = {
      authorId: userId,
      ...this.buildSearchWhereClause(search),
    };

    if (query.category) {
      where.categoryId = query.category;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        include: {
          category: {
            select: this.categorySelectOptions,
          },
          images: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return new Pagination(products, total, page, limit);
  }

  async getProduct(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        ...this.productIncludeOptions,
        offers: {
          include: {
            sender: true,
          },
        },
      },
    });
  }

  async addImages(productId: string, imageKeys: string[]) {
    const images = imageKeys.map((key) => ({
      key,
      productId,
    }));

    await this.prisma.image.createMany({
      data: images,
    });

    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
      },
    });
  }

  async deleteImage(imageId: string, productId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== productId) {
      throw new Error('Image not found or does not belong to this product');
    }

    await this.prisma.image.delete({
      where: { id: imageId },
    });

    return image;
  }
}
