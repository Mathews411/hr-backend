import { Test, TestingModule } from '@nestjs/testing';
import { ProjectDocumentsController } from './project-documents.controller';

describe('ProjectDocumentsController', () => {
  let controller: ProjectDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectDocumentsController],
    }).compile();

    controller = module.get<ProjectDocumentsController>(ProjectDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
