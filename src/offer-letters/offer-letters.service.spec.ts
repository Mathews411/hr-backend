import { Test, TestingModule } from '@nestjs/testing';
import { OfferLettersService } from './offer-letters.service';

describe('OfferLettersService', () => {
  let service: OfferLettersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfferLettersService],
    }).compile();

    service = module.get<OfferLettersService>(OfferLettersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
