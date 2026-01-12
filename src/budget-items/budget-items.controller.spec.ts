import { Test, TestingModule } from '@nestjs/testing';
import { BudgetItemsController } from './budget-items.controller';

describe('BudgetItemsController', () => {
  let controller: BudgetItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetItemsController],
    }).compile();

    controller = module.get<BudgetItemsController>(BudgetItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
