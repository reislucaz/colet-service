import { Controller, Get } from "@nestjs/common";
import { StripeService } from "../stripe/stripe.service";
import { Public } from "../utils/decorators/public";

@Controller('wallet')
export class WalletController {
  constructor(private readonly stripeService: StripeService) { }

  @Get('/')
  @Public()
  async getWallet() {
    const balance = (await this.stripeService.getBalance());
    return {
      available: balance.available,
      pending: balance.pending,
    };
  }

  @Get('/transactions')
  @Public()
  async getTransactions() {
    const transactions = await this.stripeService.getTransactions();
    return transactions;
  }
}