import { Module } from '@nestjs/common'
import { WageComplianceService } from './wage-compliance.service'
import { WageComplianceController } from './wage-compliance.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [WageComplianceController],
  providers: [WageComplianceService],
  exports: [WageComplianceService],
})
export class WageComplianceModule {}
