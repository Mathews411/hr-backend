import { Module } from '@nestjs/common'
import { AttendanceRegularizationsService } from './attendance-regularizations.service'
import { AttendanceRegularizationsController } from './attendance-regularizations.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceRegularizationsController],
  providers: [AttendanceRegularizationsService],
  exports: [AttendanceRegularizationsService],
})
export class AttendanceRegularizationsModule {}

