import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('/chat/:chatId')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req,
  ) {
    return await this.messageService.sendMessage(
      chatId,
      req.user.id,
      sendMessageDto.text,
    );
  }

  @Get('/chat/:chatId')
  async getMessages(@Param('chatId') chatId: string, @Request() req) {
    return await this.messageService.getMessages(chatId, req.user.id);
  }
}
