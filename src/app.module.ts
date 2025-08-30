import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ChatModule } from './chat/chat.module';
import { envSchema } from './config/env-schema';
import { MessageModule } from './message/message.module';
import { OfferModule } from './offer/offer.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { StripeModule } from './stripe/stripe.module';
import { UserModule } from './user/user.module';

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
      validate: (config) => {
        const env = envSchema.parse(config);
        return env;
      },
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
