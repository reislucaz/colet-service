import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pagination } from 'src/utils/pagination';
import { SearchQuery } from 'src/utils/search-query';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({
      data,
    });
  }

  async updateCategory(anId: string, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({
      where: { id: anId },
      data,
    });
  }

  async deleteCategory(anId: string) {
    return this.prisma.category.delete({
      where: { id: anId },
    });
  }

  async listCategories(query: SearchQuery): Promise<Pagination<Category>> {
    const { page, limit, q } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return new Pagination(categories, total, page, limit);
  }
}
