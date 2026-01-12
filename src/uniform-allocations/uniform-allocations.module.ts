import { Module } from '@nestjs/common'
import { UniformAllocationsService } from './uniform-allocations.service'
import { UniformAllocationsController } from './uniform-allocations.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [UniformAllocationsController],
  providers: [UniformAllocationsService],
  exports: [UniformAllocationsService],
})
export class UniformAllocationsModule {}

