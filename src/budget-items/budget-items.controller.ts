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
import { BudgetItemsService } from './budget-items.service'
import { CreateBudgetItemDto } from './dto/create-budget-item.dto'
import { UpdateBudgetItemDto } from './dto/update-budget-item.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('budget-items')
@UseGuards(JwtAuthGuard)
export class BudgetItemsController {
  constructor(private readonly budgetItemsService: BudgetItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBudgetItemDto: CreateBudgetItemDto) {
    return this.budgetItemsService.create(createBudgetItemDto)
  }

  @Get()
  findAll(@Query('projectId') projectId?: string, @Query('status') status?: string) {
    return this.budgetItemsService.findAll(projectId, status)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetItemsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetItemDto: UpdateBudgetItemDto) {
    return this.budgetItemsService.update(id, updateBudgetItemDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.budgetItemsService.remove(id)
  }
}
