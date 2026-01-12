import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    // Check if role code already exists
    const existing = await this.prisma.role.findUnique({
      where: { roleCode: createRoleDto.roleCode },
    })

    if (existing) {
      throw new BadRequestException('Role code already exists')
    }

    return this.prisma.role.create({
      data: {
        ...createRoleDto,
        permissions: createRoleDto.permissions as any, // Cast to JSON type
        isActive: createRoleDto.isActive ?? true,
      },
    })
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {}
    const roles = await this.prisma.role.findMany({
      where,
      include: {
        _count: {
          select: {
            userAssignments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform to include userCount
    return roles.map(role => ({
      ...role,
      userCount: role._count.userAssignments,
    }))
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userAssignments: true,
          },
        },
      },
    })

    if (!role) {
      throw new NotFoundException('Role not found')
    }

    return {
      ...role,
      userCount: role._count.userAssignments,
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    })

    if (!role) {
      throw new NotFoundException('Role not found')
    }

    // Check if role code is being updated and if it conflicts
    if (updateRoleDto.roleCode && updateRoleDto.roleCode !== role.roleCode) {
      const existing = await this.prisma.role.findUnique({
        where: { roleCode: updateRoleDto.roleCode },
      })

      if (existing) {
        throw new BadRequestException('Role code already exists')
      }
    }

    const updateData: any = { ...updateRoleDto }
    if (updateRoleDto.permissions) {
      updateData.permissions = updateRoleDto.permissions as any // Cast to JSON type
    }

    return this.prisma.role.update({
      where: { id },
      data: updateData,
    })
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userAssignments: true,
          },
        },
      },
    })

    if (!role) {
      throw new NotFoundException('Role not found')
    }

    if (role._count.userAssignments > 0) {
      throw new BadRequestException(
        `Cannot delete role. ${role._count.userAssignments} user(s) are assigned to this role.`
      )
    }

    return this.prisma.role.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    })

    if (!role) {
      throw new NotFoundException('Role not found')
    }

    return this.prisma.role.update({
      where: { id },
      data: { isActive: !role.isActive },
    })
  }
}

