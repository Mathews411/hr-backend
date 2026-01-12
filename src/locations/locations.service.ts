import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    // Check if branch code already exists
    const existing = await this.prisma.location.findUnique({
      where: { branchCode: createLocationDto.branchCode },
    })

    if (existing) {
      throw new Error('Branch code already exists')
    }

    return this.prisma.location.create({
      data: {
        ...createLocationDto,
        isActive: createLocationDto.isActive ?? true,
      },
    })
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {}
    return this.prisma.location.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    })

    if (!location) {
      throw new NotFoundException('Location not found')
    }

    return location
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    })

    if (!location) {
      throw new NotFoundException('Location not found')
    }

    // Check if branch code is being updated and if it conflicts
    if (updateLocationDto.branchCode && updateLocationDto.branchCode !== location.branchCode) {
      const existing = await this.prisma.location.findUnique({
        where: { branchCode: updateLocationDto.branchCode },
      })

      if (existing) {
        throw new Error('Branch code already exists')
      }
    }

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    })
  }

  async remove(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    })

    if (!location) {
      throw new NotFoundException('Location not found')
    }

    return this.prisma.location.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    })

    if (!location) {
      throw new NotFoundException('Location not found')
    }

    return this.prisma.location.update({
      where: { id },
      data: { isActive: !location.isActive },
    })
  }
}

