import { Prisma } from '@prisma/client';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
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

  @Min(0.01, {
    message: 'Preço deve ser maior que zero',
  })
  @IsNotEmpty({
    message: 'Preço é obrigatório',
  })
  price: number;

  @IsBoolean()
  @IsOptional()
  recurring: boolean = false;

  @IsString({
    message: 'Categoria deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Deve haver uma categoria',
  })
  category: string;

  //  endereço
  @IsString({
    message: 'Bairro deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Bairro é obrigatório',
  })
  neighborhood: string;

  @IsString({
    message: 'Cidade deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Cidade é obrigatória',
  })
  city: string;

  @IsString({
    message: 'Estado deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Estado é obrigatório',
  })
  state: string;

  toCreateEntity(authorId: string): Prisma.ProductCreateInput {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      recurring: this.recurring,
      neighborhood: this.neighborhood,
      city: this.city,
      state: this.state,
      author: {
        connect: {
          id: authorId,
        },
      },
      category: {
        connect: {
          id: this.category,
        },
      },
    };
  }
}
