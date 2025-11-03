import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private validateOrderParticipant(order: any, userId: string): void {
    if (order.sellerId !== userId && order.purchaserId !== userId) {
      throw new ForbiddenException('You can only access your own orders');
    }
  }

  private validateCreateOrderParticipant(
    userId: string,
    purchaserId: string,
    sellerId: string,
  ): void {
    if (userId !== purchaserId && userId !== sellerId) {
      throw new ForbiddenException(
        'You can only create orders where you are a participant',
      );
    }
  }

  private buildOrderCreateInput(data: {
    amount: number;
    productId: string;
    purchaserId: string;
    sellerId: string;
  }): Prisma.OrderCreateInput {
    return {
      amount: data.amount,
      product: {
        connect: {
          id: data.productId,
        },
      },
      purchaser: {
        connect: {
          id: data.purchaserId,
        },
      },
      seller: {
        connect: {
          id: data.sellerId,
        },
      },
    };
  }

  @Post()
  async createOrder(
    @Body()
    data: {
      amount: number;
      productId: string;
      purchaserId: string;
      sellerId: string;
    },
    @Request() req,
  ) {
    this.validateCreateOrderParticipant(
      req.user.id,
      data.purchaserId,
      data.sellerId,
    );

    const orderInput = this.buildOrderCreateInput(data);
    return this.orderService.createOrder(orderInput);
  }

  @Get('/:id')
  async getOrderById(@Param('id') id: string, @Request() req) {
    const order = await this.orderService.getOrderById(id);
    this.validateOrderParticipant(order, req.user.id);
    return order;
  }

  @Get()
  async getMyOrders(@Request() req) {
    return this.orderService.getOrdersByUserId(req.user.id);
  }

  @Put('/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body() data: Prisma.OrderUpdateInput,
    @Request() req,
  ) {
    const order = await this.orderService.getOrderById(id);
    this.validateOrderParticipant(order, req.user.id);
    return this.orderService.updateOrder(id, data);
  }

  @Delete('/:id')
  async deleteOrder(@Param('id') id: string, @Request() req) {
    const order = await this.orderService.getOrderById(id);
    this.validateOrderParticipant(order, req.user.id);
    return this.orderService.deleteOrder(id);
  }
}
