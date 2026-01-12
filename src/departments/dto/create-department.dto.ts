import { IsString, IsOptional, IsBoolean, IsEmail, IsInt, Min } from 'class-validator'

export class CreateDepartmentDto {
  @IsString()
  departmentName: string

  @IsString()
  departmentCode: string

  @IsString()
  headOfDepartment: string

  @IsEmail()
  headEmail: string

  @IsString()
  headPhone: string

  @IsString()
  description: string

  @IsOptional()
  @IsInt()
  @Min(0)
  employeeCount?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  parentDepartment?: string

  @IsOptional()
  @IsString()
  locationId?: string
}

