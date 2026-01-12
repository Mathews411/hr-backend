import { IsString, IsOptional, IsEnum } from 'class-validator'

export enum FaceEnrollmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export class CreateFaceEnrollmentDto {
  @IsString()
  employeeMasterId: string

  @IsOptional()
  @IsEnum(FaceEnrollmentStatus)
  status?: FaceEnrollmentStatus
}

