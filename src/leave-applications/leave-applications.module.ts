import { Module } from '@nestjs/common'
import { LeaveApplicationsService } from './leave-applications.service'
import { LeaveApplicationsController } from './leave-applications.controller'

@Module({
  controllers: [LeaveApplicationsController],
  providers: [LeaveApplicationsService],
  exports: [LeaveApplicationsService],
})
export class LeaveApplicationsModule {}

