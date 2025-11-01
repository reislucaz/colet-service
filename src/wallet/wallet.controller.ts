import { Controller, Get } from '@nestjs/common';
import { StripeService } from '../stripe/stripe.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('/')
  async getWallet() {
    const balance = await this.stripeService.getBalance();
    return {
      available: balance.available,
      pending: balance.pending,
    };
  }

  @Get('/transactions')
  async getTransactions() {
    const transactions = await this.stripeService.getTransactions();
    return transactions;
  }
}
