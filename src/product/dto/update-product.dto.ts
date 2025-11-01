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
    const updateData: Prisma.ProductUpdateInput = {};

    if (this.name !== undefined) updateData.name = this.name;
    if (this.description !== undefined)
      updateData.description = this.description;
    if (this.price !== undefined) updateData.price = this.price;
    if (this.recurring !== undefined) updateData.recurring = this.recurring;
    if (this.neighborhood !== undefined)
      updateData.neighborhood = this.neighborhood;
    if (this.city !== undefined) updateData.city = this.city;
    if (this.state !== undefined) updateData.state = this.state;

    if (this.category !== undefined) {
      updateData.category = {
        connect: {
          id: this.category,
        },
      };
    }

    return updateData;
  }
}
