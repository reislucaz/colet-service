import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageGateway } from './message.gateway';

@Injectable()
export class MessageService {
  private messageGateway: MessageGateway;

  constructor(private readonly prisma: PrismaService) {}

  // Este método será chamado após a criação de ambas as classes
  setMessageGateway(gateway: MessageGateway) {
    this.messageGateway = gateway;
  }

  async sendMessage(chatId: string, userId: string, text: string) {
    // Get chat to validate user is a participant and to find recipient
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    // Find the recipient (the other user in the chat)
    const recipient = chat.participants.find((p) => p.id !== userId);

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        text,
        fromUserId: userId,
        toUserId: recipient.id,
        chatId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update chat updatedAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Notify via websocket if gateway is available
    if (this.messageGateway) {
      this.messageGateway.notifyNewMessage(chatId, message);
    }

    return message;
  }

  async getMessages(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
        participants: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    return this.prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
