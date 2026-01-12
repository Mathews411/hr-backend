import { Module } from '@nestjs/common'
import { GeneratedIDCardsService } from './generated-id-cards.service'
import { GeneratedIDCardsController } from './generated-id-cards.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [GeneratedIDCardsController],
  providers: [GeneratedIDCardsService],
  exports: [GeneratedIDCardsService],
})
export class GeneratedIDCardsModule {}

