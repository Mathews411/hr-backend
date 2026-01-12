import { Module } from '@nestjs/common'
import { UserRoleAssignmentsService } from './user-role-assignments.service'
import { UserRoleAssignmentsController } from './user-role-assignments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [UserRoleAssignmentsController],
  providers: [UserRoleAssignmentsService],
  exports: [UserRoleAssignmentsService],
})
export class UserRoleAssignmentsModule {}

