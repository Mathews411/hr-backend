import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min } from 'class-validator'
import { BudgetItemStatus } from '@prisma/client'

export class CreateBudgetItemDto {
  @IsString()
  projectId: string

  @IsString()
  category: string

  @IsString()
  itemName: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  @Min(0)
  budgetedAmount: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualAmount?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  committedAmount?: number

  @IsString()
  month: string // YYYY-MM format

  @IsOptional()
  @IsEnum(BudgetItemStatus)
  status?: BudgetItemStatus

  @IsOptional()
  @IsString()
  approvedBy?: string

  @IsOptional()
  @IsDateString()
  approvedDate?: string
}

