import { PartialType } from '@nestjs/mapped-types'
import { CreateEmployeeMasterDto } from './create-employee-master.dto'

export class UpdateEmployeeMasterDto extends PartialType(CreateEmployeeMasterDto) {}

