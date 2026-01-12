import { Module } from '@nestjs/common'
import { BudgetItemsService } from './budget-items.service'
import { BudgetItemsController } from './budget-items.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [BudgetItemsController],
  providers: [BudgetItemsService],
  exports: [BudgetItemsService],
})
export class BudgetItemsModule {}
