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
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { UserResponseDto } from '../auth/dto/auth-response.dto'
import { EmployeeDocumentsService } from './employee-documents.service'
import { CreateEmployeeDocumentDto } from './dto/create-employee-document.dto'
import { UpdateEmployeeDocumentDto } from './dto/update-employee-document.dto'

@Controller('employee-documents')
@UseGuards(JwtAuthGuard)
export class EmployeeDocumentsController {
  constructor(private readonly employeeDocumentsService: EmployeeDocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createEmployeeDocumentDto: CreateEmployeeDocumentDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    // Set uploadedBy if not provided
    if (!createEmployeeDocumentDto.uploadedBy) {
      createEmployeeDocumentDto.uploadedBy = user.id
    }
    return this.employeeDocumentsService.create(createEmployeeDocumentDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('documentCategory') documentCategory?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.employeeDocumentsService.findAll(employeeMasterId, documentCategory, status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeDocumentsService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDocumentDto: UpdateEmployeeDocumentDto,
  ) {
    return this.employeeDocumentsService.update(id, updateEmployeeDocumentDto)
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.employeeDocumentsService.archive(id)
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.employeeDocumentsService.activate(id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.employeeDocumentsService.remove(id)
  }
}

