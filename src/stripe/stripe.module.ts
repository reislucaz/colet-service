import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import stripeConfig from '../config/stripe.config';
import { StripeWebhookController } from './stripe.controller';
import { OfferModule } from '../offer/offer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [stripeConfig],
    }),
    forwardRef(() => OfferModule),
  ],
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
