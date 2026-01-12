import { Test, TestingModule } from '@nestjs/testing';
import { ManagerAssignmentsController } from './manager-assignments.controller';

describe('ManagerAssignmentsController', () => {
  let controller: ManagerAssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagerAssignmentsController],
    }).compile();

    controller = module.get<ManagerAssignmentsController>(ManagerAssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
