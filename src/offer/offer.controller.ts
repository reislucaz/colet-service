import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferService } from './offer.service';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post('/chat/:chatId')
  async createOffer(
    @Param('chatId') chatId: string,
    @Body() createOfferDto: CreateOfferDto,
    @Request() req,
  ) {
    return await this.offerService.createOffer(
      chatId,
      req.user.id,
      createOfferDto.amount,
    );
  }

  @Post('/:offerId/accept')
  async acceptOffer(@Param('offerId') offerId: string, @Request() req) {
    return await this.offerService.acceptOffer(offerId, req.user.id);
  }

  @Post('/:offerId/decline')
  async declineOffer(@Param('offerId') offerId: string, @Request() req) {
    return await this.offerService.declineOffer(offerId, req.user.id);
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
  async getOffersByUser(@Request() req){
    return await this.offerService.getByUser(req.user.id);
  }
}
