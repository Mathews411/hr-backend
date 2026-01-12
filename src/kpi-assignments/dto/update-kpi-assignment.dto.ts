import { PartialType } from '@nestjs/mapped-types'
import { CreateKpiAssignmentDto } from './create-kpi-assignment.dto'

export class UpdateKpiAssignmentDto extends PartialType(CreateKpiAssignmentDto) {}

