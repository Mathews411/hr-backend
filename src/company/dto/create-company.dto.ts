import { IsString, IsOptional, IsInt, IsEmail, IsUrl, Min, Max } from 'class-validator'

export class CreateCompanyDto {
  @IsString()
  companyName: string

  @IsString()
  legalName: string

  @IsOptional()
  @IsString()
  registrationNumber?: string

  @IsOptional()
  @IsString()
  taxId?: string

  @IsOptional()
  @IsString()
  industry?: string

  @IsOptional()
  @IsString()
  companySize?: string

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  foundedYear?: number

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsUrl()
  website?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @IsString()
  zipCode?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  logoUrl?: string
}

