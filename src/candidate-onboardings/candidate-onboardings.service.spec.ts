import { Test, TestingModule } from '@nestjs/testing';
import { CandidateOnboardingsService } from './candidate-onboardings.service';

describe('CandidateOnboardingsService', () => {
  let service: CandidateOnboardingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidateOnboardingsService],
    }).compile();

    service = module.get<CandidateOnboardingsService>(CandidateOnboardingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
