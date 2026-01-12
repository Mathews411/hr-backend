import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserRoleAssignmentDto } from './dto/create-user-role-assignment.dto'
import { UpdateUserRoleAssignmentDto } from './dto/update-user-role-assignment.dto'

@Injectable()
export class UserRoleAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createUserRoleAssignmentDto: CreateUserRoleAssignmentDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createUserRoleAssignmentDto.userId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: createUserRoleAssignmentDto.roleId },
    })

    if (!role) {
      throw new NotFoundException('Role not found')
    }

    // Check if assignment already exists
    const existing = await this.prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId: createUserRoleAssignmentDto.userId,
          roleId: createUserRoleAssignmentDto.roleId,
        },
      },
    })

    if (existing) {
      throw new BadRequestException('User already has this role assigned')
    }

    return this.prisma.userRoleAssignment.create({
      data: {
        ...createUserRoleAssignmentDto,
        assignedDate: createUserRoleAssignmentDto.assignedDate
          ? new Date(createUserRoleAssignmentDto.assignedDate)
          : new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
          },
        },
        role: {
          select: {
            id: true,
            roleName: true,
            roleCode: true,
          },
        },
      },
    })
  }

  async findAll(userId?: string, roleId?: string) {
    const where: any = {}
    if (userId) where.userId = userId
    if (roleId) where.roleId = roleId

    return this.prisma.userRoleAssignment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
          },
        },
        role: {
          select: {
            id: true,
            roleName: true,
            roleCode: true,
          },
        },
      },
      orderBy: {
        assignedDate: 'desc',
      },
    })
  }

  async findOne(id: string) {
    const assignment = await this.prisma.userRoleAssignment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
          },
        },
        role: {
          select: {
            id: true,
            roleName: true,
            roleCode: true,
          },
        },
      },
    })

    if (!assignment) {
      throw new NotFoundException('User role assignment not found')
    }

    return assignment
  }

  async update(id: string, updateUserRoleAssignmentDto: UpdateUserRoleAssignmentDto) {
    const assignment = await this.prisma.userRoleAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('User role assignment not found')
    }

    // If roleId is being updated, check if new assignment would conflict
    if (updateUserRoleAssignmentDto.roleId && updateUserRoleAssignmentDto.roleId !== assignment.roleId) {
      const existing = await this.prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId: updateUserRoleAssignmentDto.userId || assignment.userId,
            roleId: updateUserRoleAssignmentDto.roleId,
          },
        },
      })

      if (existing) {
        throw new BadRequestException('User already has this role assigned')
      }
    }

    const updateData: any = { ...updateUserRoleAssignmentDto }
    if (updateUserRoleAssignmentDto.assignedDate) {
      updateData.assignedDate = new Date(updateUserRoleAssignmentDto.assignedDate)
    }

    return this.prisma.userRoleAssignment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true,
          },
        },
        role: {
          select: {
            id: true,
            roleName: true,
            roleCode: true,
          },
        },
      },
    })
  }

  async remove(id: string) {
    const assignment = await this.prisma.userRoleAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('User role assignment not found')
    }

    return this.prisma.userRoleAssignment.delete({
      where: { id },
    })
  }
}

