import { Test, TestingModule } from '@nestjs/testing';
import { ManagerAssignmentsService } from './manager-assignments.service';

describe('ManagerAssignmentsService', () => {
  let service: ManagerAssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManagerAssignmentsService],
    }).compile();

    service = module.get<ManagerAssignmentsService>(ManagerAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
