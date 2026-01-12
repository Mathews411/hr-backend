import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateManagerAssignmentDto } from './dto/create-manager-assignment.dto'
import { UpdateManagerAssignmentDto } from './dto/update-manager-assignment.dto'
import { ManagerAssignmentStatus } from '@prisma/client'

@Injectable()
export class ManagerAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createManagerAssignmentDto: CreateManagerAssignmentDto) {
    // Check if user exists and is a PROJECT_MANAGER
    const user = await this.prisma.user.findUnique({
      where: { id: createManagerAssignmentDto.userId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.role !== 'PROJECT_MANAGER') {
      throw new BadRequestException('User must have PROJECT_MANAGER role')
    }

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createManagerAssignmentDto.projectId },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // If assigning a new manager to a project, deactivate existing active assignments
    if (!createManagerAssignmentDto.previousManagerId) {
      const existingActiveAssignments = await this.prisma.managerAssignment.findMany({
        where: {
          projectId: createManagerAssignmentDto.projectId,
          status: ManagerAssignmentStatus.ACTIVE,
        },
      })

      // Get the previous manager ID if there's an active assignment
      if (existingActiveAssignments.length > 0) {
        createManagerAssignmentDto.previousManagerId = existingActiveAssignments[0].userId
      }

      // Deactivate existing active assignments
      await this.prisma.managerAssignment.updateMany({
        where: {
          projectId: createManagerAssignmentDto.projectId,
          status: ManagerAssignmentStatus.ACTIVE,
        },
        data: {
          status: ManagerAssignmentStatus.COMPLETED,
        },
      })
    }

    const assignment = await this.prisma.managerAssignment.create({
      data: {
        userId: createManagerAssignmentDto.userId,
        projectId: createManagerAssignmentDto.projectId,
        startDate: new Date(createManagerAssignmentDto.startDate),
        endDate: createManagerAssignmentDto.endDate ? new Date(createManagerAssignmentDto.endDate) : null,
        status: createManagerAssignmentDto.status || ManagerAssignmentStatus.ACTIVE,
        assignedBy: createManagerAssignmentDto.assignedBy || null,
        previousManagerId: createManagerAssignmentDto.previousManagerId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
            designation: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        previousManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return this.formatAssignmentResponse(assignment)
  }

  async findAll(userId?: string, projectId?: string, status?: ManagerAssignmentStatus) {
    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (projectId) {
      where.projectId = projectId
    }

    if (status) {
      where.status = status
    }

    const assignments = await this.prisma.managerAssignment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
            designation: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        previousManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        assignedDate: 'desc',
      },
    })

    return assignments.map(assignment => this.formatAssignmentResponse(assignment))
  }

  async findOne(id: string) {
    const assignment = await this.prisma.managerAssignment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
            designation: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        previousManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!assignment) {
      throw new NotFoundException('Manager assignment not found')
    }

    return this.formatAssignmentResponse(assignment)
  }

  async update(id: string, updateManagerAssignmentDto: UpdateManagerAssignmentDto) {
    const assignment = await this.prisma.managerAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('Manager assignment not found')
    }

    // If changing manager, handle previous manager logic
    if (updateManagerAssignmentDto.userId && updateManagerAssignmentDto.userId !== assignment.userId) {
      // Check if new user is a PROJECT_MANAGER
      const user = await this.prisma.user.findUnique({
        where: { id: updateManagerAssignmentDto.userId },
      })

      if (!user || user.role !== 'PROJECT_MANAGER') {
        throw new BadRequestException('User must have PROJECT_MANAGER role')
      }

      // Set previous manager
      updateManagerAssignmentDto.previousManagerId = assignment.userId

      // If assigning to same project, deactivate other active assignments
      if (updateManagerAssignmentDto.projectId === assignment.projectId || !updateManagerAssignmentDto.projectId) {
        await this.prisma.managerAssignment.updateMany({
          where: {
            projectId: assignment.projectId,
            status: ManagerAssignmentStatus.ACTIVE,
            id: { not: id },
          },
          data: {
            status: ManagerAssignmentStatus.COMPLETED,
          },
        })
      }
    }

    const updatedAssignment = await this.prisma.managerAssignment.update({
      where: { id },
      data: {
        ...(updateManagerAssignmentDto.userId && { userId: updateManagerAssignmentDto.userId }),
        ...(updateManagerAssignmentDto.projectId && { projectId: updateManagerAssignmentDto.projectId }),
        ...(updateManagerAssignmentDto.startDate && { startDate: new Date(updateManagerAssignmentDto.startDate) }),
        ...(updateManagerAssignmentDto.endDate !== undefined && {
          endDate: updateManagerAssignmentDto.endDate ? new Date(updateManagerAssignmentDto.endDate) : null,
        }),
        ...(updateManagerAssignmentDto.status && { status: updateManagerAssignmentDto.status }),
        ...(updateManagerAssignmentDto.assignedBy && { assignedBy: updateManagerAssignmentDto.assignedBy }),
        ...(updateManagerAssignmentDto.previousManagerId && { previousManagerId: updateManagerAssignmentDto.previousManagerId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
            designation: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        previousManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return this.formatAssignmentResponse(updatedAssignment)
  }

  async remove(id: string) {
    const assignment = await this.prisma.managerAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('Manager assignment not found')
    }

    await this.prisma.managerAssignment.delete({
      where: { id },
    })
  }

  private formatAssignmentResponse(assignment: any) {
    return {
      id: assignment.id,
      managerId: assignment.userId,
      managerName: assignment.user.name,
      managerCode: assignment.user.employeeId || '',
      designation: assignment.user.designation || '',
      department: assignment.user.department || '',
      projectId: assignment.projectId,
      projectName: assignment.project.name,
      projectCode: assignment.project.code,
      startDate: assignment.startDate ? assignment.startDate.toISOString().split('T')[0] : null,
      endDate: assignment.endDate ? assignment.endDate.toISOString().split('T')[0] : null,
      status: assignment.status === ManagerAssignmentStatus.ACTIVE ? 'Active' : 
              assignment.status === ManagerAssignmentStatus.COMPLETED ? 'Completed' : 'On Hold',
      assignedDate: assignment.assignedDate ? assignment.assignedDate.toISOString().split('T')[0] : null,
      assignedBy: assignment.assignedBy || null,
      previousManager: assignment.previousManager?.name || null,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    }
  }
}
