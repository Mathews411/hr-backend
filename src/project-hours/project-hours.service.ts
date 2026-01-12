import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectHoursDto } from './dto/create-project-hours.dto'
import { UpdateProjectHoursDto } from './dto/update-project-hours.dto'

@Injectable()
export class ProjectHoursService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateProjectHoursDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const project = await this.prisma.project.findUnique({
      where: { id: createDto.projectId },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const projectHours = await this.prisma.projectHours.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        projectId: createDto.projectId,
        date: new Date(createDto.date),
        hoursWorked: createDto.hoursWorked,
        description: createDto.description,
      },
      include: {
        employeeMaster: true,
        project: true,
      },
    })

    return this.formatResponse(projectHours)
  }

  async findAll(employeeId?: string, projectId?: string, startDate?: string, endDate?: string, search?: string) {
    const where: any = {}

    if (employeeId) {
      where.employeeMasterId = employeeId
    }

    if (projectId) {
      where.projectId = projectId
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const projectHoursList = await this.prisma.projectHours.findMany({
      where,
      include: {
        employeeMaster: true,
        project: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return projectHoursList.map((ph) => this.formatResponse(ph))
  }

  async findOne(id: string) {
    const projectHours = await this.prisma.projectHours.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        project: true,
      },
    })

    if (!projectHours) {
      throw new NotFoundException('Project hours record not found')
    }

    return this.formatResponse(projectHours)
  }

  async update(id: string, updateDto: UpdateProjectHoursDto) {
    const projectHours = await this.prisma.projectHours.findUnique({
      where: { id },
    })

    if (!projectHours) {
      throw new NotFoundException('Project hours record not found')
    }

    if (updateDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: updateDto.projectId },
      })

      if (!project) {
        throw new NotFoundException('Project not found')
      }
    }

    const updated = await this.prisma.projectHours.update({
      where: { id },
      data: {
        ...(updateDto.projectId && { projectId: updateDto.projectId }),
        ...(updateDto.date && { date: new Date(updateDto.date) }),
        ...(updateDto.hoursWorked !== undefined && { hoursWorked: updateDto.hoursWorked }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
      },
      include: {
        employeeMaster: true,
        project: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const projectHours = await this.prisma.projectHours.findUnique({
      where: { id },
    })

    if (!projectHours) {
      throw new NotFoundException('Project hours record not found')
    }

    await this.prisma.projectHours.delete({
      where: { id },
    })
  }

  private formatResponse(projectHours: any) {
    return {
      id: projectHours.id,
      employeeMasterId: projectHours.employeeMasterId,
      employeeName: projectHours.employeeMaster
        ? `${projectHours.employeeMaster.firstName} ${projectHours.employeeMaster.lastName}`
        : undefined,
      employeeCode: projectHours.employeeMaster?.employeeCode,
      department: projectHours.employeeMaster?.departmentId,
      projectId: projectHours.projectId,
      projectName: projectHours.project?.name,
      date: projectHours.date.toISOString().split('T')[0],
      hoursWorked: projectHours.hoursWorked,
      description: projectHours.description,
      status: projectHours.status,
    }
  }
}

