import { Test, TestingModule } from '@nestjs/testing';
import { CandidateOnboardingsController } from './candidate-onboardings.controller';

describe('CandidateOnboardingsController', () => {
  let controller: CandidateOnboardingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateOnboardingsController],
    }).compile();

    controller = module.get<CandidateOnboardingsController>(CandidateOnboardingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
