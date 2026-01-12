import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, Min, Max } from 'class-validator'

export class CreateAssetCategoryDto {
  @IsString()
  categoryName: string

  @IsString()
  categoryCode: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsString()
  depreciationMethod?: string // 'none', 'straight-line', 'declining-balance', 'units-of-production'

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  depreciationRate?: number // Annual depreciation rate in percentage

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  usefulLife?: number // Useful life in years

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

