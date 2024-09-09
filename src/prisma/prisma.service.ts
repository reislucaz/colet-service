import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger('PrismaService');

  async onModuleInit() {
    this.logger.log('Initializing Prisma Client');
    await this.$connect()
      .then(() => {
        this.logger.log('Connected to the database');
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }
}
