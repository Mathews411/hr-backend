import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, MinLength, Min, Max } from 'class-validator'
import { ProjectStatus } from '@prisma/client'

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name: string

  @IsString()
  @MinLength(1)
  code: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  priority?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  spent?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number

  @IsOptional()
  @IsString()
  clientName?: string

  @IsOptional()
  @IsString()
  location?: string
}

