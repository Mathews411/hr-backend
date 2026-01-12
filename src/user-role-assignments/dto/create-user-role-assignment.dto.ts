import { IsString, IsOptional, IsDateString } from 'class-validator'

export class CreateUserRoleAssignmentDto {
  @IsString()
  userId: string

  @IsString()
  roleId: string

  @IsOptional()
  @IsDateString()
  assignedDate?: string

  @IsOptional()
  @IsString()
  assignedBy?: string
}

