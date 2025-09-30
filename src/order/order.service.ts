import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({
      data,
    });
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getOrdersByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [{ sellerId: userId }, { purchaserId: userId }],  
      },
      include: {
        product: true,
        Offer: true,
        seller: true,
        purchaser: true,
      },
    });
  }

  async updateOrder(id: string, data: Prisma.OrderUpdateInput) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async deleteOrder(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
