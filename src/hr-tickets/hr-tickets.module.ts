import { Module } from '@nestjs/common'
import { HRTicketsService } from './hr-tickets.service'
import { HRTicketsController } from './hr-tickets.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [HRTicketsController],
  providers: [HRTicketsService],
  exports: [HRTicketsService],
})
export class HRTicketsModule {}

