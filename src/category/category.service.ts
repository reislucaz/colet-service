import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pagination } from 'src/utils/pagination';
import { SearchQuery } from 'src/utils/search-query';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private buildSearchWhereClause(search?: string): Prisma.CategoryWhereInput {
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

  async createCategory(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({
      data,
    });
  }

  async updateCategory(categoryId: string, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({
      where: { id: categoryId },
      data,
    });
  }

  async deleteCategory(categoryId: string) {
    return this.prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async listCategories(query: SearchQuery): Promise<Pagination<Category>> {
    const { page, limit, search } = query;
    const skip = this.calculateSkip(page, limit);
    const where = this.buildSearchWhereClause(search);

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
