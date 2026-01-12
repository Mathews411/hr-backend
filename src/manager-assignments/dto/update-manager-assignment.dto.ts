import { PartialType } from '@nestjs/mapped-types'
import { CreateManagerAssignmentDto } from './create-manager-assignment.dto'

export class UpdateManagerAssignmentDto extends PartialType(CreateManagerAssignmentDto) {}

