import { PartialType } from '@nestjs/mapped-types'
import { CreateEmployeeDocumentDto } from './create-employee-document.dto'
import { IsString, IsDateString, IsOptional, IsIn, IsBoolean } from 'class-validator'

export class UpdateEmployeeDocumentDto extends PartialType(CreateEmployeeDocumentDto) {
  @IsOptional()
  @IsString()
  documentName?: string

  @IsOptional()
  @IsString()
  documentCategory?: string

  @IsOptional()
  @IsDateString()
  expiryDate?: string

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

