import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { OfferModule } from './offer/offer.module';
import { StripeModule } from './stripe/stripe.module';
import stripeConfig from './config/stripe.config';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [stripeConfig],
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    CategoryModule,
    ProductModule,
    ChatModule,
    MessageModule,
    OfferModule,
    StripeModule,
  ],
})
export class AppModule {}
