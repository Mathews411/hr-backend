import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGeofenceAreaDto } from './dto/create-geofence-area.dto'
import { UpdateGeofenceAreaDto } from './dto/update-geofence-area.dto'

@Injectable()
export class GeofenceAreasService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateGeofenceAreaDto) {
    return this.prisma.geofenceArea.create({
      data: {
        ...createDto,
        status: createDto.status || 'INACTIVE',
        isEnabled: createDto.isEnabled ?? false,
      },
      include: {
        _count: {
          select: {
            projectAssignments: true,
          },
        },
      },
    })
  }

  async findAll(search?: string, type?: string, status?: string) {
    const where: any = {}

    if (search) {
      where.OR = [
        { geofenceName: { contains: search, mode: 'insensitive' } },
        { geofenceCode: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const geofences = await this.prisma.geofenceArea.findMany({
      where,
      include: {
        _count: {
          select: {
            projectAssignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return geofences.map(geo => ({
      ...geo,
      assignedProjects: geo._count.projectAssignments,
    }))
  }

  async findOne(id: string) {
    const geofence = await this.prisma.geofenceArea.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projectAssignments: true,
          },
        },
      },
    })

    if (!geofence) {
      throw new NotFoundException(`Geofence area with ID ${id} not found`)
    }

    return {
      ...geofence,
      assignedProjects: geofence._count.projectAssignments,
    }
  }

  async update(id: string, updateDto: UpdateGeofenceAreaDto) {
    const geofence = await this.findOne(id)

    const updated = await this.prisma.geofenceArea.update({
      where: { id },
      data: updateDto,
      include: {
        _count: {
          select: {
            projectAssignments: true,
          },
        },
      },
    })

    return {
      ...updated,
      assignedProjects: updated._count.projectAssignments,
    }
  }

  async remove(id: string) {
    await this.findOne(id)

    // Check if geofence has assigned projects
    const assignments = await this.prisma.geofenceProjectAssignment.count({
      where: { geofenceAreaId: id },
    })

    if (assignments > 0) {
      throw new Error('Cannot delete geofence with assigned projects. Please unassign projects first.')
    }

    return this.prisma.geofenceArea.delete({
      where: { id },
    })
  }

  async toggleStatus(id: string) {
    const geofence = await this.findOne(id)

    const updated = await this.prisma.geofenceArea.update({
      where: { id },
      data: {
        isEnabled: !geofence.isEnabled,
        status: !geofence.isEnabled ? 'ACTIVE' : 'INACTIVE',
      },
      include: {
        _count: {
          select: {
            projectAssignments: true,
          },
        },
      },
    })

    return {
      ...updated,
      assignedProjects: updated._count.projectAssignments,
    }
  }
}

