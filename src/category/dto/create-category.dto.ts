import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

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
    message: 'Chave do ícone deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Chave do ícone é obrigatória',
  })
  icon_key: string;

  toCreateEntity(): Prisma.CategoryCreateInput {
    return {
      name: this.name,
      description: this.description,
      iconKey: this.icon_key,
    };
  }
}
