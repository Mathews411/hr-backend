import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeAssignmentsController } from './employee-assignments.controller';

describe('EmployeeAssignmentsController', () => {
  let controller: EmployeeAssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeAssignmentsController],
    }).compile();

    controller = module.get<EmployeeAssignmentsController>(EmployeeAssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
