import { Test, TestingModule } from '@nestjs/testing';
import { ProjectDocumentsService } from './project-documents.service';

describe('ProjectDocumentsService', () => {
  let service: ProjectDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectDocumentsService],
    }).compile();

    service = module.get<ProjectDocumentsService>(ProjectDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
