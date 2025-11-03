import { Module, forwardRef } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { CreateOfferUseCase } from './use-cases/create-offer';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => StripeModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [OfferController],
  providers: [OfferService, CreateOfferUseCase],
  exports: [OfferService],
})
export class OfferModule {}
