import { Prisma } from '@prisma/client';
import {
  ArrayMinSize,
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

  @Min(0)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  recurring: boolean = false;

  @IsString({
    message: 'Cada categoria deve ser um texto',
    each: true,
  })
  @ArrayMinSize(1, {
    message: 'Deve haver pelo menos uma categoria',
  })
  categories: string[];

  //   author info

  @IsString({
    message: 'Nome do autor deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Nome do autor é obrigatório',
  })
  author_name: string;

  @IsString({
    message: 'Email do autor deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Email do autor é obrigatório',
  })
  author_email: string;

  @IsString({
    message: 'Telefone do autor deve ser um texto',
  })
  @IsNotEmpty({
    message: 'Telefone do autor é obrigatório',
  })
  author_phone: string;

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

  toCreateEntity(): Prisma.ProductCreateInput {
    return {
      name: this.name,
      description: this.description,
      price: this.price,
      recurring: this.recurring,
      neighborhood: this.neighborhood,
      city: this.city,
      state: this.state,
      authorName: this.author_name,
      authorEmail: this.author_email,
      authorPhone: this.author_phone,
      categories: {
        connect: this.categories.map((id) => ({ id })),
      },
    };
  }
}
