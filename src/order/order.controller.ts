import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { OrderService } from "./order.service";

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() data: { amount: number, productId: string, purchaserId: string, sellerId: string }) {
    return this.orderService.createOrder({
      amount: data.amount,
      product:{
        connect:{
          id: data.productId
        }
      },
      purchaser:{
        connect:{
          id: data.purchaserId
        }
      },
      seller:{
        connect:{
          id: data.sellerId
        }
      },
    });
  }

  @Get('/:id')
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Get('/user/:userId')
  async getOrdersByUserId(@Param('userId') userId: string) {
    return this.orderService.getOrdersByUserId(userId);
  }

  @Put('/:id')
  async updateOrder(@Param('id') id: string, @Body() data: Prisma.OrderUpdateInput) {
    return this.orderService.updateOrder(id, data);
  }

  @Delete('/:id')
  async deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}