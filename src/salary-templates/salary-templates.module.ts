import { Module } from '@nestjs/common'
import { SalaryTemplatesService } from './salary-templates.service'
import { SalaryTemplatesController } from './salary-templates.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [SalaryTemplatesController],
  providers: [SalaryTemplatesService],
  exports: [SalaryTemplatesService],
})
export class SalaryTemplatesModule {}

