import { Module } from '@nestjs/common'
import { EmployeeAssetsService } from './employee-assets.service'
import { EmployeeAssetsController } from './employee-assets.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeAssetsController],
  providers: [EmployeeAssetsService],
  exports: [EmployeeAssetsService],
})
export class EmployeeAssetsModule {}

