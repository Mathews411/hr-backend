import { PartialType } from '@nestjs/mapped-types'
import { CreateUserRoleAssignmentDto } from './create-user-role-assignment.dto'

export class UpdateUserRoleAssignmentDto extends PartialType(CreateUserRoleAssignmentDto) {}

