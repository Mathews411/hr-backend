import { Test, TestingModule } from '@nestjs/testing';
import { OfferLettersController } from './offer-letters.controller';

describe('OfferLettersController', () => {
  let controller: OfferLettersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferLettersController],
    }).compile();

    controller = module.get<OfferLettersController>(OfferLettersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
