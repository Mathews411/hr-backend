import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { UserResponseDto, ProjectDto } from '../auth/dto/auth-response.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findAll(role?: string, isActive?: boolean) {
    const where: any = {}
    
    if (role) {
      where.role = role
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return users.map(user => this.formatUserResponse(user))
  }

  async findOne(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.formatUserResponse(user)
  }

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    // Check employeeId uniqueness if provided
    if (createUserDto.employeeId) {
      const existingEmployeeId = await this.prisma.user.findUnique({
        where: { employeeId: createUserDto.employeeId },
      })

      if (existingEmployeeId) {
        throw new ConflictException('User with this employee ID already exists')
      }
    }

    // Validate role exists in Role table and get the roleCode
    let userRole: string = createUserDto.role.toUpperCase()
    
    // Try to find the role in the Role table
    const role = await this.prisma.role.findFirst({
      where: {
        OR: [
          { roleCode: createUserDto.role },
          { roleCode: createUserDto.role.toUpperCase() },
          { roleCode: { equals: createUserDto.role, mode: 'insensitive' } }
        ],
        isActive: true
      }
    })

    if (role) {
      // Use the roleCode from the Role table (should match UserRole enum)
      userRole = role.roleCode.toUpperCase()
    } else {
      // If role not found in Role table, validate it's a valid UserRole enum value
      const validRoles = ['ADMIN', 'PROJECT_DIRECTOR', 'PROJECT_HR', 'PROJECT_MANAGER', 'EMPLOYEE']
      if (!validRoles.includes(userRole)) {
        throw new ConflictException(`Invalid role: ${createUserDto.role}. Role must exist in the Role table or be one of: ${validRoles.join(', ')}`)
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: userRole as any, // Cast to UserRole enum
        employeeId: createUserDto.employeeId,
        department: createUserDto.department,
        designation: createUserDto.designation,
        company: createUserDto.company || this.configService.get<string>('DEFAULT_COMPANY') || 'Exozen',
        projects: {
          create: createUserDto.projectIds?.map(projectId => ({
            projectId,
          })) || [],
        },
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    })

    return this.formatUserResponse(user)
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      throw new NotFoundException('User not found')
    }

    // Check if email is being updated and if it conflicts
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      })

      if (emailExists) {
        throw new ConflictException('User with this email already exists')
      }
    }

    // Check if employeeId is being updated and if it conflicts
    if (updateUserDto.employeeId && updateUserDto.employeeId !== existingUser.employeeId) {
      const employeeIdExists = await this.prisma.user.findUnique({
        where: { employeeId: updateUserDto.employeeId },
      })

      if (employeeIdExists) {
        throw new ConflictException('User with this employee ID already exists')
      }
    }

    // Validate role if being updated
    let userRole: string | undefined = undefined
    if (updateUserDto.role) {
      userRole = updateUserDto.role.toUpperCase()
      
      // Try to find the role in the Role table
      const role = await this.prisma.role.findFirst({
        where: {
          OR: [
            { roleCode: updateUserDto.role },
            { roleCode: updateUserDto.role.toUpperCase() },
            { roleCode: { equals: updateUserDto.role, mode: 'insensitive' } }
          ],
          isActive: true
        }
      })

      if (role) {
        // Use the roleCode from the Role table (should match UserRole enum)
        userRole = role.roleCode.toUpperCase()
      } else {
        // If role not found in Role table, validate it's a valid UserRole enum value
        const validRoles = ['ADMIN', 'PROJECT_DIRECTOR', 'PROJECT_HR', 'PROJECT_MANAGER', 'EMPLOYEE']
        if (!validRoles.includes(userRole)) {
          throw new ConflictException(`Invalid role: ${updateUserDto.role}. Role must exist in the Role table or be one of: ${validRoles.join(', ')}`)
        }
      }
    }

    // Hash password if provided
    let hashedPassword = existingUser.password
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10)
    }

    // Update user projects if projectIds provided
    if (updateUserDto.projectIds !== undefined) {
      // Delete existing project associations
      await this.prisma.userProject.deleteMany({
        where: { userId },
      })

      // Create new project associations
      if (updateUserDto.projectIds.length > 0) {
        await this.prisma.userProject.createMany({
          data: updateUserDto.projectIds.map(projectId => ({
            userId,
            projectId,
          })),
        })
      }
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateUserDto.email && { email: updateUserDto.email }),
        ...(userRole && { role: userRole as any }), // Cast to UserRole enum
        ...(updateUserDto.password && { password: hashedPassword }),
        ...(updateUserDto.name && { name: updateUserDto.name }),
        ...(updateUserDto.employeeId !== undefined && { employeeId: updateUserDto.employeeId }),
        ...(updateUserDto.department !== undefined && { department: updateUserDto.department }),
        ...(updateUserDto.designation !== undefined && { designation: updateUserDto.designation }),
        ...(updateUserDto.company !== undefined && { company: updateUserDto.company }),
        ...(updateUserDto.isActive !== undefined && { isActive: updateUserDto.isActive }),
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    })

    return this.formatUserResponse(user)
  }

  async remove(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.prisma.user.delete({
      where: { id: userId },
    })

    return { message: 'User deleted successfully' }
  }

  private formatUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employeeId || undefined,
      department: user.department || undefined,
      designation: user.designation || undefined,
      company: user.company || undefined,
      isActive: user.isActive !== undefined ? user.isActive : true,
      projects: user.projects?.map((up: any) => ({
        id: up.project.id,
        name: up.project.name,
        code: up.project.code,
      })) || [],
    }
  }
}

