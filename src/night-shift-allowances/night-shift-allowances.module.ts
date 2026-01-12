import { Module } from '@nestjs/common'
import { NightShiftAllowancesService } from './night-shift-allowances.service'
import { NightShiftAllowancesController } from './night-shift-allowances.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [NightShiftAllowancesController],
  providers: [NightShiftAllowancesService],
  exports: [NightShiftAllowancesService],
})
export class NightShiftAllowancesModule {}

