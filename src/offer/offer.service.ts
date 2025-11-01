import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { OfferStatus } from '@prisma/client';
import { ChatGateway } from 'src/chat/chat.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class OfferService {
  private chatGateway: ChatGateway;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => ChatGateway))
    chatGateway: ChatGateway,
  ) {
    this.chatGateway = chatGateway;
  }

  private async findPendingOfferWithDetails(offerId: string) {
    return this.prisma.offer.findUnique({
      where: {
        id: offerId,
        status: OfferStatus.PENDING,
      },
      include: {
        chat: {
          include: {
            product: true,
          },
        },
        sender: true,
        recipient: true,
      },
    });
  }

  private async updateOfferStatus(offerId: string, status: OfferStatus) {
    return this.prisma.offer.update({
      where: {
        id: offerId,
      },
      data: {
        status,
      },
    });
  }

  private async createOrderFromOffer(offer: any, offerId: string) {
    return this.prisma.order.create({
      data: {
        amount: offer.amount,
        Offer: {
          connect: {
            id: offerId,
          },
        },
        product: {
          connect: {
            id: offer.productId,
          },
        },
        status: 'PENDING',
        seller: {
          connect: {
            id: offer.recipient.id,
          },
        },
        purchaser: {
          connect: {
            id: offer.sender.id,
          },
        },
      },
    });
  }

  private async createSystemMessage(
    text: string,
    fromUserId: string,
    toUserId: string,
    chatId: string,
  ) {
    return this.prisma.message.create({
      data: {
        text,
        fromUserId,
        toUserId,
        chatId,
      },
    });
  }

  async acceptOffer(offerId: string, userId: string) {
    const offer = await this.findPendingOfferWithDetails(offerId);

    if (!offer) {
      throw new NotFoundException(
        'Offer not found, already processed, or you are not the recipient',
      );
    }

    const updatedOffer = await this.updateOfferStatus(
      offerId,
      OfferStatus.ACCEPTED,
    );

    await this.createOrderFromOffer(offer, offerId);

    const acceptanceMessage = `Proposta de R$ ${offer.amount.toFixed(2)} foi aceita. Aguardando pagamento.`;
    await this.createSystemMessage(
      acceptanceMessage,
      userId,
      offer.senderId,
      offer.chatId,
    );

    this.chatGateway.notifyOfferStatusChange(offer.chatId, updatedOffer);

    return updatedOffer;
  }

  private async findOfferByRecipient(offerId: string, userId: string) {
    return this.prisma.offer.findUnique({
      where: {
        id: offerId,
        recipientId: userId,
        status: OfferStatus.PENDING,
      },
      include: {
        sender: true,
      },
    });
  }

  async declineOffer(offerId: string, userId: string) {
    const offer = await this.findOfferByRecipient(offerId, userId);

    if (!offer) {
      throw new NotFoundException(
        'Offer not found, already processed, or you are not the recipient',
      );
    }

    const updatedOffer = await this.updateOfferStatus(
      offerId,
      OfferStatus.DECLINED,
    );

    const declineMessage = `Proposta de R$ ${offer.amount.toFixed(2)} foi recusada.`;
    await this.createSystemMessage(
      declineMessage,
      userId,
      offer.senderId,
      offer.chatId,
    );

    this.chatGateway.notifyOfferStatusChange(offer.chatId, updatedOffer);

    return updatedOffer;
  }

  private async findAcceptedOfferBySender(offerId: string, userId: string) {
    return this.prisma.offer.findUnique({
      where: {
        id: offerId,
        senderId: userId,
        status: OfferStatus.ACCEPTED,
      },
      include: {
        sender: true,
        recipient: true,
        chat: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  private async ensureStripeCustomer(
    userId: string,
    userName: string,
    userEmail: string,
    currentCustomerId?: string,
  ): Promise<string> {
    if (currentCustomerId) {
      return currentCustomerId;
    }

    const customerId = await this.stripeService.createCustomer(
      userName,
      userEmail,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });

    return customerId;
  }

  private async createAndLinkPaymentIntent(
    offerId: string,
    amount: number,
    customerId: string,
  ) {
    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      customerId,
      offerId,
    );

    await this.prisma.offer.update({
      where: { id: offerId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return paymentIntent;
  }

  async initiatePayment(offerId: string, userId: string) {
    const offer = await this.findAcceptedOfferBySender(offerId, userId);

    if (!offer) {
      throw new NotFoundException(
        'Offer not found, not accepted yet, or you are not the sender',
      );
    }

    const stripeCustomerId = await this.ensureStripeCustomer(
      userId,
      offer.sender.name,
      offer.sender.email,
      offer.sender.stripeCustomerId,
    );

    await this.createAndLinkPaymentIntent(
      offerId,
      offer.amount,
      stripeCustomerId,
    );

    return {};
  }

  private async findOfferReadyForPayment(offerId: string) {
    return this.prisma.offer.findUnique({
      where: {
        id: offerId,
        status: OfferStatus.ACCEPTED,
        stripePaymentIntentId: { not: null },
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  private async verifyPaymentSuccess(paymentIntentId: string) {
    const paymentIntent =
      await this.stripeService.confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment has not been completed yet');
    }

    return paymentIntent;
  }

  async confirmPayment(offerId: string) {
    const offer = await this.findOfferReadyForPayment(offerId);

    if (!offer) {
      throw new NotFoundException('Offer not found or not ready for payment');
    }

    await this.verifyPaymentSuccess(offer.stripePaymentIntentId);

    const updatedOffer = await this.updateOfferStatus(
      offerId,
      OfferStatus.PAID,
    );

    const paymentMessage = `Pagamento de R$ ${offer.amount.toFixed(
      2,
    )} foi confirmado. Agora vocês podem combinar a entrega.`;
    await this.createSystemMessage(
      paymentMessage,
      offer.senderId,
      offer.recipientId,
      offer.chatId,
    );

    this.chatGateway.notifyOfferStatusChange(offer.chatId, updatedOffer);

    return updatedOffer;
  }

  async getByUser(userId: string) {
    const offers = await this.prisma.offer.findMany({
      where: {
        OR: [
          {
            sender: {
              id: userId,
            },
          },
          {
            recipient: {
              id: userId,
            },
          },
        ],
      },
      include: {
        sender: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return offers;
  }

  async getByChat(chatId: string) {
    const offer = await this.prisma.offer.findFirst({
      where: {
        chatId,
        status: OfferStatus.PENDING,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }
}
