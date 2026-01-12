import { Module } from '@nestjs/common'
import { AppraisalCyclesService } from './appraisal-cycles.service'
import { AppraisalCyclesController } from './appraisal-cycles.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AppraisalCyclesController],
  providers: [AppraisalCyclesService],
  exports: [AppraisalCyclesService],
})
export class AppraisalCyclesModule {}

