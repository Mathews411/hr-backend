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
import { LeavePoliciesService } from './leave-policies.service'
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto'
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto'

@Controller('leave-policies')
@UseGuards(JwtAuthGuard)
export class LeavePoliciesController {
  constructor(private readonly leavePoliciesService: LeavePoliciesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeavePolicyDto: CreateLeavePolicyDto) {
    return this.leavePoliciesService.create(createLeavePolicyDto)
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined
    return this.leavePoliciesService.findAll(isActiveBool)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavePoliciesService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeavePolicyDto: UpdateLeavePolicyDto) {
    return this.leavePoliciesService.update(id, updateLeavePolicyDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leavePoliciesService.remove(id)
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.leavePoliciesService.toggleActive(id)
  }
}

