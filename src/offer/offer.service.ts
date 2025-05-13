import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OfferStatus } from '@prisma/client';
import { StripeService } from '../stripe/stripe.service';
import { MessageGateway } from 'src/message/message.gateway';

@Injectable()
export class OfferService {
  private messageGateway: MessageGateway;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => MessageGateway))
    messageGateway: MessageGateway,
  ) {
    this.messageGateway = messageGateway;
  }

  async createOffer(chatId: string, userId: string, amount: number) {
    // Verify chat exists and user is a participant
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
      (p) => p.id !== userId && p.email === chat.product.authorEmail,
    );

    if (!recipient) {
      throw new NotFoundException('Product owner not found');
    }

    // Create the offer
    const offer = await this.prisma.offer.create({
      data: {
        amount,
        senderId: userId,
        recipientId: recipient.id,
        chatId,
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
    this.messageGateway.notifyNewOffer(chatId, offer);

    return offer;
  }

  async acceptOffer(offerId: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: {
        id: offerId,
        recipientId: userId,
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

    if (!offer) {
      throw new NotFoundException(
        'Offer not found, already processed, or you are not the recipient',
      );
    }

    // Update offer status
    const updatedOffer = await this.prisma.offer.update({
      where: {
        id: offerId,
      },
      data: {
        status: OfferStatus.ACCEPTED,
      },
    });

    // Create a system message about the acceptance
    await this.prisma.message.create({
      data: {
        text: `Proposta de R$ ${offer.amount.toFixed(2)} foi aceita. Aguardando pagamento.`,
        fromUserId: userId,
        toUserId: offer.senderId,
        chatId: offer.chatId,
      },
    });

    // Notify via websocket
    this.messageGateway.notifyOfferStatusChange(offer.chatId, updatedOffer);

    return updatedOffer;
  }

  async declineOffer(offerId: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: {
        id: offerId,
        recipientId: userId,
        status: OfferStatus.PENDING,
      },
      include: {
        sender: true,
      },
    });

    if (!offer) {
      throw new NotFoundException(
        'Offer not found, already processed, or you are not the recipient',
      );
    }

    // Update offer status
    const updatedOffer = await this.prisma.offer.update({
      where: {
        id: offerId,
      },
      data: {
        status: OfferStatus.DECLINED,
      },
    });

    // Create a system message about the decline
    await this.prisma.message.create({
      data: {
        text: `Proposta de R$ ${offer.amount.toFixed(2)} foi recusada.`,
        fromUserId: userId,
        toUserId: offer.senderId,
        chatId: offer.chatId,
      },
    });

    // Notify via websocket
    this.messageGateway.notifyOfferStatusChange(offer.chatId, updatedOffer);

    return updatedOffer;
  }

  async initiatePayment(offerId: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({
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

    if (!offer) {
      throw new NotFoundException(
        'Offer not found, not accepted yet, or you are not the sender',
      );
    }

    // Ensure sender has a Stripe customer ID
    if (!offer.sender.stripeCustomerId) {
      const customerId = await this.stripeService.createCustomer(
        offer.sender.name,
        offer.sender.email,
      );

      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });

      offer.sender.stripeCustomerId = customerId;
    }

    // Create payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent(
      offer.amount,
      offer.sender.stripeCustomerId,
      offerId,
    );

    // Update offer with payment intent ID
    await this.prisma.offer.update({
      where: { id: offerId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    // Create checkout URL
    const successUrl = `${process.env.FRONTEND_URL}/payments/success?offer=${offerId}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/payments/cancel?offer=${offerId}`;

    const checkoutUrl = await this.stripeService.createPaymentSession(
      paymentIntent.id,
      successUrl,
      cancelUrl,
    );

    return { checkoutUrl };
  }

  async confirmPayment(offerId: string) {
    const offer = await this.prisma.offer.findUnique({
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

    if (!offer) {
      throw new NotFoundException('Offer not found or not ready for payment');
    }

    // Check payment status with Stripe
    const paymentIntent = await this.stripeService.confirmPaymentIntent(
      offer.stripePaymentIntentId,
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment has not been completed yet');
    }

    // Update offer status to PAID
    const updatedOffer = await this.prisma.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.PAID },
    });

    // Create a system message about the payment
    const message = await this.prisma.message.create({
      data: {
        text: `Pagamento de R$ ${offer.amount.toFixed(
          2,
        )} foi confirmado. Agora vocês podem combinar a entrega.`,
        fromUserId: offer.senderId,
        toUserId: offer.recipientId,
        chatId: offer.chatId,
      },
    });

    // Notify via websocket
    this.messageGateway.notifyOfferStatusChange(offer.chatId, updatedOffer);

    return updatedOffer;
  }
}
