import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, Min } from 'class-validator'

export class CreateDesignationDto {
  @IsString()
  designationName: string

  @IsString()
  designationCode: string

  @IsString()
  department: string

  @IsString()
  description: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalary?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  employeeCount?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

