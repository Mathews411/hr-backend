import { PartialType } from '@nestjs/mapped-types'
import { CreateKYCVerificationDto } from './create-kyc-verification.dto'
import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator'

export class UpdateKYCVerificationDto extends PartialType(CreateKYCVerificationDto) {
  @IsOptional()
  @IsIn(['PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'])
  verificationStatus?: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED'

  @IsOptional()
  @IsString()
  verifiedBy?: string

  @IsOptional()
  @IsDateString()
  verifiedDate?: string

  @IsOptional()
  @IsString()
  overallRemarks?: string
}

