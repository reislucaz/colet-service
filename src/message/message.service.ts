import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(chatId: string, userId: string, text: string) {
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

    const recipient = chat.participants.find((p) => p.id !== userId);

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

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

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

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
