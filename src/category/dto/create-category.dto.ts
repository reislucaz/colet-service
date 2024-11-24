import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({
    message: 'Nome deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Nome é obrigatório',
  })
  name: string;

  @IsString({
    message: 'Descrição deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Descrição é obrigatória',
  })
  description: string;

  @IsString({
    message: 'ID da imagem deve ser um texto',
  })
  @IsOptional()
  image_id?: string;

  toCreateEntity(): Prisma.CategoryCreateInput {
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
