import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({
    description: 'Valor da proposta',
    example: 100.5,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;
  @ApiProperty({
    description: 'ID do chat',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @ApiProperty({
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;
}
