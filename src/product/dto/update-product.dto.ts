import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class updateProductDTO {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  recurring?: boolean;

  @IsOptional()
  category?: string;

  @IsOptional()
  neighborhood?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  state?: string;

  toUpdateEntity(): Prisma.ProductUpdateInput {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      recurring: this.recurring,
      neighborhood: this.neighborhood,
      city: this.city,
      state: this.state,
      category: {
        connect: {
          id: this.category,
        },
      },
    };
  }
}
