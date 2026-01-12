import { Module } from '@nestjs/common'
import { ShiftAssignmentsService } from './shift-assignments.service'
import { ShiftAssignmentsController } from './shift-assignments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ShiftAssignmentsController],
  providers: [ShiftAssignmentsService],
  exports: [ShiftAssignmentsService],
})
export class ShiftAssignmentsModule {}
