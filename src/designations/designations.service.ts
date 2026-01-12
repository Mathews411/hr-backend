import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDesignationDto } from './dto/create-designation.dto'
import { UpdateDesignationDto } from './dto/update-designation.dto'

@Injectable()
export class DesignationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDesignationDto: CreateDesignationDto) {
    // Check if designation code already exists
    const existing = await this.prisma.designation.findUnique({
      where: { designationCode: createDesignationDto.designationCode },
    })

    if (existing) {
      throw new Error('Designation code already exists')
    }

    return this.prisma.designation.create({
      data: {
        ...createDesignationDto,
        employeeCount: createDesignationDto.employeeCount ?? 0,
        isActive: createDesignationDto.isActive ?? true,
      },
    })
  }

  async findAll(isActive?: boolean, department?: string) {
    const where: any = {}
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    if (department) {
      where.department = department
    }
    return this.prisma.designation.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: string) {
    const designation = await this.prisma.designation.findUnique({
      where: { id },
    })

    if (!designation) {
      throw new NotFoundException('Designation not found')
    }

    return designation
  }

  async update(id: string, updateDesignationDto: UpdateDesignationDto) {
    const designation = await this.prisma.designation.findUnique({
      where: { id },
    })

    if (!designation) {
      throw new NotFoundException('Designation not found')
    }

    // Check if designation code is being updated and if it conflicts
    if (updateDesignationDto.designationCode && updateDesignationDto.designationCode !== designation.designationCode) {
      const existing = await this.prisma.designation.findUnique({
        where: { designationCode: updateDesignationDto.designationCode },
      })

      if (existing) {
        throw new Error('Designation code already exists')
      }
    }

    return this.prisma.designation.update({
      where: { id },
      data: updateDesignationDto,
    })
  }

  async remove(id: string) {
    const designation = await this.prisma.designation.findUnique({
      where: { id },
    })

    if (!designation) {
      throw new NotFoundException('Designation not found')
    }

    return this.prisma.designation.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const designation = await this.prisma.designation.findUnique({
      where: { id },
    })

    if (!designation) {
      throw new NotFoundException('Designation not found')
    }

    return this.prisma.designation.update({
      where: { id },
      data: { isActive: !designation.isActive },
    })
  }
}

