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
    if (req.user.id !== data.purchaserId && req.user.id !== data.sellerId) {
      throw new ForbiddenException(
        'You can only create orders where you are a participant',
      );
    }

    return this.orderService.createOrder({
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
    });
  }

  @Get('/:id')
  async getOrderById(@Param('id') id: string, @Request() req) {
    const order = await this.orderService.getOrderById(id);

    if (order.sellerId !== req.user.id && order.purchaserId !== req.user.id) {
      throw new ForbiddenException('You can only view your own orders');
    }

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

    if (order.sellerId !== req.user.id && order.purchaserId !== req.user.id) {
      throw new ForbiddenException('You can only update your own orders');
    }

    return this.orderService.updateOrder(id, data);
  }

  @Delete('/:id')
  async deleteOrder(@Param('id') id: string, @Request() req) {
    const order = await this.orderService.getOrderById(id);

    if (order.sellerId !== req.user.id && order.purchaserId !== req.user.id) {
      throw new ForbiddenException('You can only delete your own orders');
    }

    return this.orderService.deleteOrder(id);
  }
}
