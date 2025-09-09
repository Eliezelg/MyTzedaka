import { Module } from '@nestjs/common';
import { ParnassController } from './parnass.controller';
import { ParnassService } from './parnass.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParnassController],
  providers: [ParnassService],
  exports: [ParnassService],
})
export class ParnassModule {}