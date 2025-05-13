import { Module, forwardRef } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => StripeModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
