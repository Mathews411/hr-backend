import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { CreateFaceEnrollmentDto, FaceEnrollmentStatus } from './create-face-enrollment.dto'

export class UpdateFaceEnrollmentDto extends PartialType(CreateFaceEnrollmentDto) {
  @IsOptional()
  @IsEnum(FaceEnrollmentStatus)
  status?: FaceEnrollmentStatus

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number
}

