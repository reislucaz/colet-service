import {
  Controller,
  Post,
  RawBodyRequest,
  Req,
  Headers,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Public } from 'src/utils/decorators/public';
import { StripeService } from './stripe.service';
import { OfferService } from 'src/offer/offer.service';

@Controller('webhooks')
export class StripeWebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly stripeService: StripeService,
    private readonly offerService: OfferService,
  ) {}

  @Public()
  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new HttpException(
        'Missing stripe-signature header',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const event = this.stripeService.constructWebhookEvent(
        req.rawBody,
        signature,
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const offerId = paymentIntent.metadata.offerId;

        if (offerId) {
          await this.offerService.confirmPayment(offerId);
        }
      }

      return { received: true };
    } catch (err) {
      throw new HttpException(
        `Webhook Error: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
