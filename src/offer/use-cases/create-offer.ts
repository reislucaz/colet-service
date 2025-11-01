import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatGateway } from '../../chat/chat.gateway';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateOfferDto {
  chatId: string;
  userId: string;
  amount: number;
  productId: string;
}

@Injectable()
export class CreateOfferUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
  ) { }

  async execute({ amount, chatId, productId, userId }: CreateOfferDto) {
    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Offer amount must be greater than zero');
    }
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
        product: true,
      },
    });

    if (!chat) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    // Determine recipient (product owner)
    const recipient = chat.participants.find(
      (p) => p.id !== userId && p.id === chat.product.authorId,
    );

    if (!recipient) {
      throw new NotFoundException('Product owner not found');
    }

    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Validate user is not making offer to themselves
    if (product.authorId === userId) {
      throw new BadRequestException(
        'You cannot make an offer to your own product',
      );
    }

    // Create the offer
    const offer = await this.prisma.offer.create({
      data: {
        amount,
        senderId: userId,
        recipientId: recipient.id,
        chatId,
        productId: product.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create a system message about the offer
    await this.prisma.message.create({
      data: {
        text: `Proposta de compra enviada: R$ ${amount.toFixed(2)}`,
        fromUserId: userId,
        toUserId: recipient.id,
        chatId,
      },
    });

    // Update chat updatedAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Notify via websocket
    this.chatGateway.notifyNewOffer(chatId, offer);

    return offer;
  }
}
