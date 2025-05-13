import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá, tenho interesse neste produto.',
  })
  @IsNotEmpty()
  @IsString()
  text: string;
}
