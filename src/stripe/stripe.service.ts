import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
      apiVersion: '2023-10-16',
    });
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
      currency: this.configService.get('stripe.currency'),
      customer: customerId,
      metadata: {
        offerId,
      },
    });

    return paymentIntent;
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createPaymentSession(
    paymentIntentId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: this.configService.get('stripe.currency'),
            product_data: {
              name: 'Payment for Offer',
            },
            unit_amount_decimal: (
              await this.stripe.paymentIntents.retrieve(paymentIntentId)
            ).amount.toString(),
          },
          quantity: 1,
        },
      ],
    });

    return session.url;
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get('stripe.webhookSecret');
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }
}
