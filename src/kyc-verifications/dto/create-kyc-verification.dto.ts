import { IsString, IsDateString, IsOptional, IsEnum, IsArray, ValidateNested, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateKYCDocumentDto {
  @IsString()
  documentType: string

  @IsString()
  documentNumber: string

  @IsDateString()
  issueDate: string

  @IsOptional()
  @IsDateString()
  expiryDate?: string

  @IsString()
  issuingAuthority: string

  @IsOptional()
  @IsString()
  documentFile?: string

  @IsOptional()
  @IsIn(['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'])
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'

  @IsOptional()
  @IsString()
  remarks?: string
}

export class CreateKYCVerificationDto {
  @IsString()
  employeeMasterId: string

  @IsOptional()
  @IsIn(['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'])
  verificationStatus?: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED'

  @IsOptional()
  @IsDateString()
  submittedDate?: string

  @IsOptional()
  @IsString()
  overallRemarks?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKYCDocumentDto)
  documents: CreateKYCDocumentDto[]
}

