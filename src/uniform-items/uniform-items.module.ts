import { Module } from '@nestjs/common'
import { UniformItemsService } from './uniform-items.service'
import { UniformItemsController } from './uniform-items.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [UniformItemsController],
  providers: [UniformItemsService],
  exports: [UniformItemsService],
})
export class UniformItemsModule {}

