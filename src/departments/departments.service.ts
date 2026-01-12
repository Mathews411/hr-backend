import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // Check if department code already exists
    const existing = await this.prisma.department.findUnique({
      where: { departmentCode: createDepartmentDto.departmentCode },
    })

    if (existing) {
      throw new Error('Department code already exists')
    }

    // Validate locationId if provided
    if (createDepartmentDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: createDepartmentDto.locationId },
      })
      if (!location) {
        throw new Error('Location not found')
      }
    }

    return this.prisma.department.create({
      data: {
        ...createDepartmentDto,
        employeeCount: createDepartmentDto.employeeCount ?? 0,
        isActive: createDepartmentDto.isActive ?? true,
      },
    })
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {}
    const departments = await this.prisma.department.findMany({
      where,
      include: {
        location: {
          select: {
            id: true,
            branchName: true,
            branchCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Format response to include locationId directly (for frontend compatibility)
    return departments.map(dept => ({
      ...dept,
      locationId: dept.locationId || undefined,
    }))
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        location: {
          select: {
            id: true,
            branchName: true,
            branchCode: true,
          },
        },
      },
    })

    if (!department) {
      throw new NotFoundException('Department not found')
    }

    return department
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    })

    if (!department) {
      throw new NotFoundException('Department not found')
    }

    // Check if department code is being updated and if it conflicts
    if (updateDepartmentDto.departmentCode && updateDepartmentDto.departmentCode !== department.departmentCode) {
      const existing = await this.prisma.department.findUnique({
        where: { departmentCode: updateDepartmentDto.departmentCode },
      })

      if (existing) {
        throw new Error('Department code already exists')
      }
    }

    // Validate locationId if provided
    if (updateDepartmentDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: updateDepartmentDto.locationId },
      })
      if (!location) {
        throw new Error('Location not found')
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    })
  }

  async remove(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    })

    if (!department) {
      throw new NotFoundException('Department not found')
    }

    return this.prisma.department.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    })

    if (!department) {
      throw new NotFoundException('Department not found')
    }

    return this.prisma.department.update({
      where: { id },
      data: { isActive: !department.isActive },
    })
  }
}

