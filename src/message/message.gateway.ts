import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { Logger, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SendMessageDto } from './dto/send-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'messages',
})
export class MessageGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit
{
  private readonly logger = new Logger(MessageGateway.name);
  private userSocketMap = new Map<string, string>();

  @WebSocketServer() server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // Resolve circular dependency
  onModuleInit() {
    this.messageService.setMessageGateway(this);
  }

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!userId) {
        client.disconnect();
        return;
      }

      // Associate user ID with socket ID
      this.userSocketMap.set(userId, client.id);

      client.join(`user_${userId}`);
      this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove user from userSocketMap
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        break;
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(client: Socket, chatId: string) {
    client.join(`chat_${chatId}`);
    this.logger.log(`Client ${client.id} joined chat: ${chatId}`);
    return { event: 'joinedChat', data: { chatId } };
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(client: Socket, chatId: string) {
    client.leave(`chat_${chatId}`);
    this.logger.log(`Client ${client.id} left chat: ${chatId}`);
    return { event: 'leftChat', data: { chatId } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { chatId: string; message: SendMessageDto },
  ): Promise<WsResponse<any>> {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];
      const jwtPayload = this.jwtService.verify(token);
      const userId = jwtPayload.sub;

      const message = await this.messageService.sendMessage(
        payload.chatId,
        userId,
        payload.message.text,
      );

      // Get the chat to find all participants
      const chat = await this.prisma.chat.findUnique({
        where: { id: payload.chatId },
        include: { participants: true },
      });

      if (chat) {
        // Emit to all participants in the chat
        this.server.to(`chat_${payload.chatId}`).emit('newMessage', message);

        // Also emit to user-specific rooms in case they're not in the chat room
        chat.participants.forEach((participant) => {
          this.server.to(`user_${participant.id}`).emit('newMessage', {
            ...message,
            chatId: payload.chatId,
          });
        });
      }

      return { event: 'messageSent', data: message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      return { event: 'messageError', data: { error: error.message } };
    }
  }

  // Method to be called from the MessageService to broadcast messages
  notifyNewMessage(chatId: string, message: any) {
    this.server.to(`chat_${chatId}`).emit('newMessage', message);
  }

  // Method to be called when a new offer is created
  notifyNewOffer(chatId: string, offer: any) {
    this.server.to(`chat_${chatId}`).emit('newOffer', offer);
  }

  // Method to be called when an offer status changes
  notifyOfferStatusChange(chatId: string, offer: any) {
    this.server.to(`chat_${chatId}`).emit('offerStatusChanged', offer);
  }
}
