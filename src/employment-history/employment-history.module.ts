import { Module } from '@nestjs/common'
import { EmploymentHistoryService } from './employment-history.service'
import { EmploymentHistoryController } from './employment-history.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [EmploymentHistoryController],
  providers: [EmploymentHistoryService],
  exports: [EmploymentHistoryService],
})
export class EmploymentHistoryModule {}

