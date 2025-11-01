import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pagination } from 'src/utils/pagination';
import { ProductQuery } from './query/product-query';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: {
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
      },
    });
  }

  async updateProduct(anId: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id: anId },
      data,
    });
  }

  async deleteProduct(anId: string) {
    return this.prisma.product.delete({
      where: { id: anId },
    });
  }

  async listProducts(query: ProductQuery): Promise<Pagination<Product>> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

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
            select: {
              id: true,
              name: true,
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
    const skip = (page - 1) * limit;
    console.log(search);
    const where: Prisma.ProductWhereInput = {
      authorId: userId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
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
            select: {
              id: true,
              name: true,
            },
          },
          images: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return new Pagination(products, total, page, limit);
  }

  async getProduct(anId: string) {
    return this.prisma.product.findUnique({
      where: { id: anId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            iconKey: true,
          },
        },
        offers: {
          include: {
            sender: true,
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
