import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Pagination } from '../utils/pagination';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChat(productId: string, userId: string, sellerId: string) {
    // Check if chat already exists between these users for this product
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        productId,
        participants: {
          every: {
            id: {
              in: [userId, sellerId],
            },
          },
        },
      },
    });

    if (existingChat) {
      return existingChat;
    }

    return this.prisma.chat.create({
      data: {
        productId,
        participants: {
          connect: [{ id: userId }, { id: sellerId }],
        },
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
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
        },
      },
    });
  }

  async getUserChats(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                take: 1,
              },
            },
          },
          participants: {
            select: {
              id: true,
              name: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      }),
      this.prisma.chat.count({
        where: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
      }),
    ]);

    return new Pagination(chats, total, page, limit);
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
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
        },
        offers: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async getOtherParticipant(chat: any, currentUserId: string): Promise<User> {
    return chat.participants.find((p) => p.id !== currentUserId);
  }
}
