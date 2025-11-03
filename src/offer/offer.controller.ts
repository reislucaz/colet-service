import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferService } from './offer.service';
import { CreateOfferUseCase } from './use-cases/create-offer';

@Controller('offers')
export class OfferController {
  constructor(
    private readonly offerService: OfferService,
    private readonly createOfferUseCase: CreateOfferUseCase,
  ) {}

  @Post('/chat/:chatId')
  async createOffer(
    @Param('chatId') chatId: string,
    @Body() createOfferDto: CreateOfferDto,
    @Request() req,
  ) {
    return await this.createOfferUseCase.execute({
      chatId,
      userId: req.user.id,
      amount: createOfferDto.amount,
      productId: createOfferDto.productId,
    });
  }

  @Post(':offerId/accept')
  async acceptOffer(@Param('offerId') offerId: string, @Request() req) {
    return await this.offerService.acceptOffer(offerId, req.user.id);
  }

  @Post(':offerId/decline')
  async declineOffer(@Param('offerId') offerId: string, @Request() req) {
    return await this.offerService.declineOffer(offerId, req.user.id);
  }

  @Get('/chat/:chatId')
  async getOfferByChat(@Param('chatId') chatId: string) {
    return await this.offerService.getByChat(chatId);
  }

  @Post('/:offerId/pay')
  async initiatePayment(@Param('offerId') offerId: string, @Request() req) {
    return await this.offerService.initiatePayment(offerId, req.user.id);
  }

  @Post('/:offerId/confirm-payment')
  async confirmPayment(@Param('offerId') offerId: string) {
    return await this.offerService.confirmPayment(offerId);
  }

  @Get('/')
  async getOffersByUser(@Request() req) {
    return await this.offerService.getByUser(req.user.id);
  }
}
