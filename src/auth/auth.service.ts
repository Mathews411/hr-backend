import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { AuthResponseDto, UserResponseDto, ProjectDto } from './dto/auth-response.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    })

    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    // Check employeeId uniqueness if provided
    if (registerDto.employeeId) {
      const existingEmployeeId = await this.prisma.user.findUnique({
        where: { employeeId: registerDto.employeeId },
      })

      if (existingEmployeeId) {
        throw new ConflictException('User with this employee ID already exists')
      }
    }

    // Validate role exists in Role table and get the roleCode
    let userRole: string = registerDto.role.toUpperCase()
    
    // Try to find the role in the Role table
    const role = await this.prisma.role.findFirst({
      where: {
        OR: [
          { roleCode: registerDto.role },
          { roleCode: registerDto.role.toUpperCase() },
          { roleCode: { equals: registerDto.role, mode: 'insensitive' } }
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
        throw new ConflictException(`Invalid role: ${registerDto.role}. Role must exist in the Role table or be one of: ${validRoles.join(', ')}`)
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    // Get projects if projectIds provided
    let projects: ProjectDto[] = []
    if (registerDto.projectIds && registerDto.projectIds.length > 0) {
      const projectRecords = await this.prisma.project.findMany({
        where: {
          id: { in: registerDto.projectIds },
        },
      })
      projects = projectRecords.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
      }))
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: userRole as any, // Cast to UserRole enum
        employeeId: registerDto.employeeId,
        department: registerDto.department,
        designation: registerDto.designation,
        company: registerDto.company || this.configService.get<string>('DEFAULT_COMPANY') || 'Exozen',
        projects: {
          create: registerDto.projectIds?.map(projectId => ({
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

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = this.jwtService.sign(payload)

    // Format user response
    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employeeId || undefined,
      department: user.department || undefined,
      designation: user.designation || undefined,
      company: user.company || undefined,
      isActive: user.isActive !== undefined ? user.isActive : true,
      projects: user.projects.map(up => ({
        id: up.project.id,
        name: up.project.name,
        code: up.project.code,
      })),
    }

    return {
      user: userResponse,
      accessToken,
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = this.jwtService.sign(payload)

    // Format user response
    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employeeId || undefined,
      department: user.department || undefined,
      designation: user.designation || undefined,
      company: user.company || undefined,
      isActive: user.isActive !== undefined ? user.isActive : true,
      projects: user.projects.map(up => ({
        id: up.project.id,
        name: up.project.name,
        code: up.project.code,
      })),
    }

    return {
      user: userResponse,
      accessToken,
    }
  }

  async validateUser(userId: string): Promise<UserResponseDto | null> {
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

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employeeId || undefined,
      department: user.department || undefined,
      designation: user.designation || undefined,
      company: user.company || undefined,
      projects: user.projects.map(up => ({
        id: up.project.id,
        name: up.project.name,
        code: up.project.code,
      })),
    }
  }
}

