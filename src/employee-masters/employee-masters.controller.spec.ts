import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeMastersController } from './employee-masters.controller';

describe('EmployeeMastersController', () => {
  let controller: EmployeeMastersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeMastersController],
    }).compile();

    controller = module.get<EmployeeMastersController>(EmployeeMastersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
