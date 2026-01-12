import { IsString, IsOptional, IsBoolean } from 'class-validator'

export class CreateProjectCategoryDto {
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
  @IsBoolean()
  isActive?: boolean
}

