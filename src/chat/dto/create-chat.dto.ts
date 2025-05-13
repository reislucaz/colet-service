import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 'clq1234abcd',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'ID do vendedor',
    example: 'clq5678efgh',
  })
  @IsNotEmpty()
  @IsString()
  sellerId: string;
}
