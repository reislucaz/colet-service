import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import stripeConfig from '../config/stripe.config';
import { OfferModule } from '../offer/offer.module';
import { StripeWebhookController } from './stripe.controller';
import { StripeService } from './stripe.service';

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
