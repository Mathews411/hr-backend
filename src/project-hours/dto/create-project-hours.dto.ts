import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator'

export class CreateProjectHoursDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  projectId: string

  @IsDateString()
  date: string

  @IsNumber()
  hoursWorked: number

  @IsOptional()
  @IsString()
  description?: string

}

