import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IapService } from './iap.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/gaurds/gaurd.access_token';

@ApiTags('IAP')
@ApiBearerAuth('JWT-auth')
@UseGuards(AccessTokenGuard)
@Controller('iap')
export class IapController {
  constructor(private readonly iapService: IapService) {}

  @Post('apple/verify')
  async verifyAppleReceipt(
    @Body('transactionReceipt') transactionReceipt: string,
  ) {
    return await this.iapService.verifyAppleReceipt(transactionReceipt);
  }

  @Post('google/verify')
  async verifyGoogleReceipt(
    @Body('packageName') packageName: string,
    @Body('token') token: string,
    @Body('productId') productId: string,
  ) {
    return await this.iapService.verifyGoogleReceipt(
      packageName,
      token,
      productId,
    );
  }
}
