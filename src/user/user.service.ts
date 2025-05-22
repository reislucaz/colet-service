import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async createUser(data: Prisma.UserCreateInput) {
    const user = await this.prisma.user.create({
      data,
    });

    // Create Stripe customer
    const stripeCustomerId = await this.stripeService.createCustomer(
      user.name,
      user.email,
    );

    // Update user with Stripe customer ID
    return this.prisma.user.update({
      where: { id: user.id },
      data: { id: stripeCustomerId },
    });
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}
