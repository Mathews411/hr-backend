import { IsEmail, IsString, IsOptional, IsArray, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @MinLength(1)
  name: string

  @IsString()
  @MinLength(1)
  role: string

  @IsOptional()
  @IsString()
  employeeId?: string

  @IsOptional()
  @IsString()
  department?: string

  @IsOptional()
  @IsString()
  designation?: string

  @IsOptional()
  @IsString()
  company?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projectIds?: string[]
}

