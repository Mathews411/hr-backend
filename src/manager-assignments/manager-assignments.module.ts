import { Module } from '@nestjs/common'
import { ManagerAssignmentsService } from './manager-assignments.service'
import { ManagerAssignmentsController } from './manager-assignments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ManagerAssignmentsController],
  providers: [ManagerAssignmentsService],
  exports: [ManagerAssignmentsService],
})
export class ManagerAssignmentsModule {}
