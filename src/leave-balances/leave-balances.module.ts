import { Module } from '@nestjs/common'
import { LeaveBalancesService } from './leave-balances.service'
import { LeaveBalancesController } from './leave-balances.controller'

@Module({
  controllers: [LeaveBalancesController],
  providers: [LeaveBalancesService],
  exports: [LeaveBalancesService],
})
export class LeaveBalancesModule {}

