import { Prisma } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString({
    message: 'Nome deve ser um texto',
  })
  @IsOptional({
    message: 'Nome é obrigatório',
  })
  name: string;

  @IsString({
    message: 'Descrição deve ser um texto',
  })
  @IsOptional({
    message: 'Descrição é obrigatória',
  })
  description: string;

  @IsString({
    message: 'ID da imagem deve ser um texto',
  })
  @IsOptional()
  image_id?: string;

  toUpdateEntity(): Prisma.CategoryUpdateInput {
    return {
      name: this.name,
      description: this.description,
      image: this.image_id
        ? {
            connect: {
              id: this.image_id,
            },
          }
        : undefined,
    };
  }
}
