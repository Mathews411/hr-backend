import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator'

export class UpdateKYCDocumentDto {
  @IsOptional()
  @IsIn(['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'])
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'

  @IsOptional()
  @IsString()
  verifiedBy?: string

  @IsOptional()
  @IsDateString()
  verifiedDate?: string

  @IsOptional()
  @IsString()
  rejectionReason?: string

  @IsOptional()
  @IsString()
  remarks?: string
}

