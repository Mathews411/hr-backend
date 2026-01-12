import { Module } from '@nestjs/common'
import { LeaveDeductionsService } from './leave-deductions.service'
import { LeaveDeductionsController } from './leave-deductions.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [LeaveDeductionsController],
  providers: [LeaveDeductionsService],
  exports: [LeaveDeductionsService],
})
export class LeaveDeductionsModule {}

