import { Module } from '@nestjs/common'
import { LeaveEncashmentsService } from './leave-encashments.service'
import { LeaveEncashmentsController } from './leave-encashments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [LeaveEncashmentsController],
  providers: [LeaveEncashmentsService],
  exports: [LeaveEncashmentsService],
})
export class LeaveEncashmentsModule {}

