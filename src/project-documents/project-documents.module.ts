import { Module } from '@nestjs/common'
import { ProjectDocumentsService } from './project-documents.service'
import { ProjectDocumentsController } from './project-documents.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ProjectDocumentsController],
  providers: [ProjectDocumentsService],
  exports: [ProjectDocumentsService],
})
export class ProjectDocumentsModule {}
