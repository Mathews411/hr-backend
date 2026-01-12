import { UserRole } from '@prisma/client'

export class ProjectDto {
  id: string
  name: string
  code: string
}

export class UserResponseDto {
  id: string
  email: string
  name: string
  role: UserRole
  employeeId?: string
  department?: string
  designation?: string
  company?: string
  isActive?: boolean
  projects: ProjectDto[]
}

export class AuthResponseDto {
  user: UserResponseDto
  accessToken: string
  refreshToken?: string
}

