import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Env } from '../config/env-schema';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService<Env>,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'));
  }

  async createCustomer(name: string, email: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      name,
      email,
    });

    return customer.id;
  }

  async createPaymentIntent(
    amount: number,
    customerId: string,
    offerId: string,
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe works with cents
      currency: this.configService.get('STRIPE_CURRENCY'),
      customer: customerId,
      metadata: {
        offerId,
      },
    });

    return paymentIntent;
  }

  async getBalance(): Promise<Stripe.Balance> {
    return await this.stripe.balance.retrieve();
  }

  async getTransactions(): Promise<Stripe.BalanceTransaction[]> {
    return (
      await this.stripe.balanceTransactions.list({
        currency: this.configService.get('STRIPE_CURRENCY'),
      })
    ).data;
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createPaymentSession(productId: string): Promise<string> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const session = await this.stripe.paymentIntents.create({
      amount: product.price * 100,
      currency: this.configService.get('STRIPE_CURRENCY'),
      automatic_payment_methods: { enabled: true },
    });
    return session.client_secret;
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }
}
