import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class PermissionActionDto {
  @IsOptional()
  @IsBoolean()
  view?: boolean

  @IsOptional()
  @IsBoolean()
  create?: boolean

  @IsOptional()
  @IsBoolean()
  edit?: boolean

  @IsOptional()
  @IsBoolean()
  delete?: boolean

  @IsOptional()
  @IsBoolean()
  approve?: boolean
}

class PermissionDto {
  @IsString()
  module: string

  @ValidateNested()
  @Type(() => PermissionActionDto)
  actions: PermissionActionDto
}

export class CreateRoleDto {
  @IsString()
  roleName: string

  @IsString()
  roleCode: string

  @IsString()
  description: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[]

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

