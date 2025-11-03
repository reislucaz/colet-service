import { INestApplication, ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Test, TestingModule } from '@nestjs/testing';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

export class TestSetup {
  app: INestApplication;
  prisma: PrismaService;

  async init(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();

    this.app.setGlobalPrefix('api');
    this.app.useWebSocketAdapter(new IoAdapter(this.app));
    this.app.use(
      '/uploads',
      express.static(path.join(process.cwd(), 'uploads')),
    );

    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    this.prisma = this.app.get(PrismaService);

    await this.app.init();
  }

  async cleanup(): Promise<void> {
    await this.cleanDatabase();

    const uploadsPath = path.join(process.cwd(), 'uploads', 'products');
    if (fs.existsSync(uploadsPath)) {
      fs.rmSync(uploadsPath, { recursive: true, force: true });
    }

    await this.prisma.$disconnect();
    await this.app.close();
  }

  async createTestCategory(id = 'test-category-id'): Promise<void> {
    await this.prisma.category.create({
      data: {
        id,
        name: 'Eletrônicos Teste',
        description: 'Categoria de teste',
        iconKey: 'Monitor',
      },
    });
  }

  async cleanDatabase(): Promise<void> {
    await this.prisma.order.deleteMany();
    await this.prisma.offer.deleteMany();
    await this.prisma.message.deleteMany();
    await this.prisma.chat.deleteMany();
    await this.prisma.image.deleteMany();
    await this.prisma.product.deleteMany();
    await this.prisma.category.deleteMany();
    await this.prisma.user.deleteMany();
  }
}
