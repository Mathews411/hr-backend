import { IsEmail, IsString, MinLength, IsOptional, IsArray } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
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

