import { IsString, IsOptional, IsBoolean, IsEmail, IsNumber, Min, Max } from 'class-validator'

export class CreateLocationDto {
  @IsString()
  branchName: string

  @IsString()
  branchCode: string

  @IsString()
  address: string

  @IsString()
  city: string

  @IsString()
  state: string

  @IsString()
  country: string

  @IsString()
  zipCode: string

  @IsString()
  phone: string

  @IsEmail()
  email: string

  @IsString()
  managerName: string

  @IsEmail()
  managerEmail: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number
}

