import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Request() req) {
    return await this.chatService.createChat(
      createChatDto.productId,
      req.user.id,
      createChatDto.sellerId,
    );
  }

  @Get()
  async getUserChats(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return await this.chatService.getUserChats(req.user.id, page);
  }

  @Get('/:id')
  async getChatById(@Param('id') id: string, @Request() req) {
    return await this.chatService.getChatById(id, req.user.id);
  }
}
