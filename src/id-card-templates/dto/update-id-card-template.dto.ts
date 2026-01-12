import { IsString, IsOptional, IsBoolean } from 'class-validator'

export class UpdateIDCardTemplateDto {
  @IsString()
  @IsOptional()
  templateName?: string

  @IsString()
  @IsOptional()
  backgroundColor?: string

  @IsString()
  @IsOptional()
  textColor?: string

  @IsString()
  @IsOptional()
  accentColor?: string

  @IsString()
  @IsOptional()
  logoPosition?: string

  @IsString()
  @IsOptional()
  photoPosition?: string

  @IsBoolean()
  @IsOptional()
  showQRCode?: boolean

  @IsBoolean()
  @IsOptional()
  showDepartment?: boolean

  @IsBoolean()
  @IsOptional()
  showDesignation?: boolean

  @IsBoolean()
  @IsOptional()
  showEmployeeCode?: boolean

  @IsBoolean()
  @IsOptional()
  showJoiningDate?: boolean

  @IsBoolean()
  @IsOptional()
  showExpiryDate?: boolean

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean

  @IsString()
  @IsOptional()
  logoUrl?: string

  @IsString()
  @IsOptional()
  companyName?: string

  @IsString()
  @IsOptional()
  companyAddress?: string

  @IsBoolean()
  @IsOptional()
  showEmployeePhoto?: boolean
}

