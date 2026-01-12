import { Module } from '@nestjs/common';
import { OfferLettersController } from './offer-letters.controller';
import { OfferLettersService } from './offer-letters.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OfferLettersController],
  providers: [OfferLettersService]
})
export class OfferLettersModule {}
