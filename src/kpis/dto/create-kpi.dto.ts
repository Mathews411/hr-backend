import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export enum KPIFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL'
}

export class CreateKpiDto {
  @IsString()
  kpiName: string

  @IsString()
  kpiCode: string

  @IsString()
  category: string

  @IsString()
  description: string

  @IsString()
  measurementUnit: string

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  targetValue: number

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  weightage: number

  @IsEnum(KPIFrequency)
  frequency: KPIFrequency

  @IsOptional()
  @IsString()
  department?: string

  @IsOptional()
  @IsString()
  designation?: string

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean
}

