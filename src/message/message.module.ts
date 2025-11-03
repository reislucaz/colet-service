import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
