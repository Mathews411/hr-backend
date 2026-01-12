import { PartialType } from '@nestjs/mapped-types'
import { CreateSalaryTemplateDto } from './create-salary-template.dto'

export class UpdateSalaryTemplateDto extends PartialType(CreateSalaryTemplateDto) {}

