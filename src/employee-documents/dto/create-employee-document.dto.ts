import { IsString, IsDateString, IsOptional, IsEnum, IsBoolean, IsInt, IsIn } from 'class-validator'

export class CreateEmployeeDocumentDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  documentName: string

  @IsString()
  documentType: string

  @IsString()
  documentCategory: string

  @IsInt()
  fileSize: number

  @IsOptional()
  @IsString()
  fileUrl?: string

  @IsOptional()
  @IsDateString()
  uploadDate?: string

  @IsOptional()
  @IsDateString()
  expiryDate?: string

  @IsOptional()
  @IsString()
  uploadedBy?: string

  @IsOptional()
  @IsIn(['ACTIVE', 'ARCHIVED', 'EXPIRED'])
  status?: 'ACTIVE' | 'ARCHIVED' | 'EXPIRED'

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  version?: string

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean
}

