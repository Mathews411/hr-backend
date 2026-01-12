import { PartialType } from '@nestjs/mapped-types'
import { CreateLeaveDeductionDto } from './create-leave-deduction.dto'

export class UpdateLeaveDeductionDto extends PartialType(CreateLeaveDeductionDto) {}

