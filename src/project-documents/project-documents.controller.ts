import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ProjectDocumentsService } from './project-documents.service'
import { CreateProjectDocumentDto } from './dto/create-project-document.dto'
import { UpdateProjectDocumentDto } from './dto/update-project-document.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('project-documents')
@UseGuards(JwtAuthGuard)
export class ProjectDocumentsController {
  constructor(private readonly projectDocumentsService: ProjectDocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDocumentDto: CreateProjectDocumentDto) {
    return this.projectDocumentsService.create(createProjectDocumentDto)
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.projectDocumentsService.findAll(
      projectId,
      category,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    )
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectDocumentsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDocumentDto: UpdateProjectDocumentDto) {
    return this.projectDocumentsService.update(id, updateProjectDocumentDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.projectDocumentsService.remove(id)
  }
}
