import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { WalletController } from './wallet.controller';

@Module({
  imports: [PrismaModule, StripeModule],
  controllers: [WalletController],
})
export class Walletmodule {}
