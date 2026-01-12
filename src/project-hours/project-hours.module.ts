import { Module } from '@nestjs/common'
import { ProjectHoursService } from './project-hours.service'
import { ProjectHoursController } from './project-hours.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ProjectHoursController],
  providers: [ProjectHoursService],
  exports: [ProjectHoursService],
})
export class ProjectHoursModule {}

