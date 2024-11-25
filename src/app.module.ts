import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    CategoryModule,
    ProductModule,
  ],
})
export class AppModule {}
