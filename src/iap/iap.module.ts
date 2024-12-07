import { Module } from '@nestjs/common';
import { IapService } from './iap.service';
import { IapController } from './iap.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AppstoreTransaction,
  AppstoreTransactionSchema,
} from 'src/_schemas/appstore-transaction.schema';
import {
  GooglePayTransaction,
  GooglePayTransactionSchema,
} from 'src/_schemas/googlepay-transaction.schema';
import { iapConfig } from 'src/_config/iap.config';
import { IAPModule } from '@jeremybarbet/nest-iap';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppstoreTransaction.name, schema: AppstoreTransactionSchema },
      { name: GooglePayTransaction.name, schema: GooglePayTransactionSchema },
    ]),
    IAPModule.forRoot(iapConfig),
  ],
  controllers: [IapController],
  providers: [IapService],
})
export class IapModule {}
