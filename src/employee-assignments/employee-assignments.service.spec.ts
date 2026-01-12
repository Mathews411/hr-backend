import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeAssignmentsService } from './employee-assignments.service';

describe('EmployeeAssignmentsService', () => {
  let service: EmployeeAssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeAssignmentsService],
    }).compile();

    service = module.get<EmployeeAssignmentsService>(EmployeeAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
