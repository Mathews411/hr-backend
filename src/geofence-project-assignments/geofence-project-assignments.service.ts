import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGeofenceProjectAssignmentDto } from './dto/create-geofence-project-assignment.dto'
import { UpdateGeofenceProjectAssignmentDto } from './dto/update-geofence-project-assignment.dto'

@Injectable()
export class GeofenceProjectAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateGeofenceProjectAssignmentDto) {
    // Check if assignment already exists
    const existing = await this.prisma.geofenceProjectAssignment.findUnique({
      where: {
        projectId_geofenceAreaId: {
          projectId: createDto.projectId,
          geofenceAreaId: createDto.geofenceAreaId,
        },
      },
    })

    if (existing) {
      throw new ConflictException('This geofence is already assigned to the selected project')
    }

    return this.prisma.geofenceProjectAssignment.create({
      data: {
        ...createDto,
        status: createDto.status || 'ACTIVE',
      },
      include: {
        project: true,
        geofenceArea: true,
      },
    })
  }

  async findAll(projectId?: string) {
    const where: any = {}

    if (projectId && projectId !== 'all') {
      where.projectId = projectId
    }

    const assignments = await this.prisma.geofenceProjectAssignment.findMany({
      where,
      include: {
        project: true,
        geofenceArea: true,
      },
      orderBy: { assignedDate: 'desc' },
    })

    return assignments.map(assignment => ({
      id: assignment.id,
      projectId: assignment.projectId,
      projectName: assignment.project.name,
      projectCode: assignment.project.code,
      geofenceId: assignment.geofenceAreaId,
      geofenceName: assignment.geofenceArea.geofenceName,
      geofenceCode: assignment.geofenceArea.geofenceCode,
      location: assignment.geofenceArea.location,
      latitude: assignment.geofenceArea.latitude,
      longitude: assignment.geofenceArea.longitude,
      radius: assignment.geofenceArea.radius,
      assignedDate: assignment.assignedDate.toISOString().split('T')[0],
      assignedBy: assignment.assignedBy || 'System',
      status: assignment.status,
    }))
  }

  async findOne(id: string) {
    const assignment = await this.prisma.geofenceProjectAssignment.findUnique({
      where: { id },
      include: {
        project: true,
        geofenceArea: true,
      },
    })

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`)
    }

    return {
      id: assignment.id,
      projectId: assignment.projectId,
      projectName: assignment.project.name,
      projectCode: assignment.project.code,
      geofenceId: assignment.geofenceAreaId,
      geofenceName: assignment.geofenceArea.geofenceName,
      geofenceCode: assignment.geofenceArea.geofenceCode,
      location: assignment.geofenceArea.location,
      latitude: assignment.geofenceArea.latitude,
      longitude: assignment.geofenceArea.longitude,
      radius: assignment.geofenceArea.radius,
      assignedDate: assignment.assignedDate.toISOString().split('T')[0],
      assignedBy: assignment.assignedBy || 'System',
      status: assignment.status,
    }
  }

  async update(id: string, updateDto: UpdateGeofenceProjectAssignmentDto) {
    await this.findOne(id)

    return this.prisma.geofenceProjectAssignment.update({
      where: { id },
      data: updateDto,
      include: {
        project: true,
        geofenceArea: true,
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    return this.prisma.geofenceProjectAssignment.delete({
      where: { id },
    })
  }
}

