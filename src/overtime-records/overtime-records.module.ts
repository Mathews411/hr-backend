import { Module } from '@nestjs/common'
import { OvertimeRecordsService } from './overtime-records.service'
import { OvertimeRecordsController } from './overtime-records.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [OvertimeRecordsController],
  providers: [OvertimeRecordsService],
  exports: [OvertimeRecordsService],
})
export class OvertimeRecordsModule {}

