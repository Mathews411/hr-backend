import { PartialType } from '@nestjs/mapped-types'
import { CreateAttendanceRegularizationDto } from './create-attendance-regularization.dto'

export class UpdateAttendanceRegularizationDto extends PartialType(CreateAttendanceRegularizationDto) {}

