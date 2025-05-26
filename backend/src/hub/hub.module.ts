import { Module } from '@nestjs/common';
import { HubController } from './hub.controller';
import { HubService } from './hub.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HubController],
  providers: [HubService],
  exports: [HubService],
})
export class HubModule {}
