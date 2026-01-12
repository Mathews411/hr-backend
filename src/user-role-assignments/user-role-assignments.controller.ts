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
import { UserRoleAssignmentsService } from './user-role-assignments.service'
import { CreateUserRoleAssignmentDto } from './dto/create-user-role-assignment.dto'
import { UpdateUserRoleAssignmentDto } from './dto/update-user-role-assignment.dto'

@Controller('user-role-assignments')
@UseGuards(JwtAuthGuard)
export class UserRoleAssignmentsController {
  constructor(private readonly userRoleAssignmentsService: UserRoleAssignmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserRoleAssignmentDto: CreateUserRoleAssignmentDto) {
    return this.userRoleAssignmentsService.create(createUserRoleAssignmentDto)
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Query('roleId') roleId?: string) {
    return this.userRoleAssignmentsService.findAll(userId, roleId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRoleAssignmentsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserRoleAssignmentDto: UpdateUserRoleAssignmentDto) {
    return this.userRoleAssignmentsService.update(id, updateUserRoleAssignmentDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userRoleAssignmentsService.remove(id)
  }
}

