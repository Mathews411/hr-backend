import { Module } from '@nestjs/common'
import { ContractLabourReportsService } from './contract-labour-reports.service'
import { ContractLabourReportsController } from './contract-labour-reports.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ContractLabourReportsController],
  providers: [ContractLabourReportsService],
  exports: [ContractLabourReportsService],
})
export class ContractLabourReportsModule {}

