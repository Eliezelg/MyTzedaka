import { Module } from '@nestjs/common';
import { TaxReceiptService } from './tax-receipt.service';
import { TaxReceiptController } from './tax-receipt.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [TaxReceiptController],
  providers: [TaxReceiptService],
  exports: [TaxReceiptService],
})
export class TaxReceiptModule {}