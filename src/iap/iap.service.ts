import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppstoreTransaction } from 'src/_schemas/appstore-transaction.schema';
import { GooglePayTransaction } from 'src/_schemas/googlepay-transaction.schema';
import { IAPService as NestIAPService } from '@jeremybarbet/nest-iap';
import { VerifyResponse } from 'src/_types/iap.type';

@Injectable()
export class IapService {
  constructor(
    @InjectModel(AppstoreTransaction.name)
    private appstoreTransactionModel: Model<AppstoreTransaction>,
    @InjectModel(GooglePayTransaction.name)
    private googlePayTransactionModel: Model<GooglePayTransaction>,
    private readonly nestIAPService: NestIAPService,
  ) {}

  async verifyAppleReceipt(transactionReceipt: string) {
    const verifyResponse: VerifyResponse =
      await this.nestIAPService.verifyAppleReceipt({ transactionReceipt });

    if (verifyResponse.error) {
      throw new Error(verifyResponse.error);
    }

    const newTransaction = new this.appstoreTransactionModel(
      verifyResponse.data,
    );
    await newTransaction.save();
    return verifyResponse.data;
  }

  async verifyGoogleReceipt(
    packageName: string,
    token: string,
    productId: string,
  ) {
    const verifyResponse: VerifyResponse =
      await this.nestIAPService.verifyGoogleReceipt({
        packageName,
        token,
        productId,
      });

    if (verifyResponse.error) {
      throw new Error(verifyResponse.error);
    }

    const newTransaction = new this.googlePayTransactionModel(
      verifyResponse.data,
    );
    await newTransaction.save();
    return verifyResponse.data;
  }
}
