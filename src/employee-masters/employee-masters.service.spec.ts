import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeMastersService } from './employee-masters.service';

describe('EmployeeMastersService', () => {
  let service: EmployeeMastersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeMastersService],
    }).compile();

    service = module.get<EmployeeMastersService>(EmployeeMastersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
