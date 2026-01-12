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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ProjectCategoriesService } from './project-categories.service'
import { CreateProjectCategoryDto } from './dto/create-project-category.dto'
import { UpdateProjectCategoryDto } from './dto/update-project-category.dto'

@Controller('project-categories')
@UseGuards(JwtAuthGuard)
export class ProjectCategoriesController {
  constructor(private readonly projectCategoriesService: ProjectCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectCategoryDto: CreateProjectCategoryDto) {
    return this.projectCategoriesService.create(createProjectCategoryDto)
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined
    return this.projectCategoriesService.findAll(isActiveBool)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectCategoriesService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectCategoryDto: UpdateProjectCategoryDto) {
    return this.projectCategoriesService.update(id, updateProjectCategoryDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.projectCategoriesService.remove(id)
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.projectCategoriesService.toggleActive(id)
  }
}

