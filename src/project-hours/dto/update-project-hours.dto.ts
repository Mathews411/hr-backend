import { PartialType } from '@nestjs/mapped-types'
import { CreateProjectHoursDto } from './create-project-hours.dto'

export class UpdateProjectHoursDto extends PartialType(CreateProjectHoursDto) {}

