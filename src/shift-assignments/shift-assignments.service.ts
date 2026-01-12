import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto'
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto'

@Injectable()
export class ShiftAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createShiftAssignmentDto: CreateShiftAssignmentDto) {
    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createShiftAssignmentDto.projectId },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // Validate shift exists
    const shift = await this.prisma.shift.findUnique({
      where: { id: createShiftAssignmentDto.shiftId },
    })

    if (!shift) {
      throw new NotFoundException('Shift not found')
    }

    // Validate assignment type
    if (createShiftAssignmentDto.assignmentType === 'Employee') {
      if (!createShiftAssignmentDto.employeeId) {
        throw new BadRequestException('Employee ID is required for Employee assignment type')
      }
      const employee = await this.prisma.employee.findUnique({
        where: { id: createShiftAssignmentDto.employeeId },
      })
      if (!employee) {
        throw new NotFoundException('Employee not found')
      }
    } else if (createShiftAssignmentDto.assignmentType === 'Department') {
      if (!createShiftAssignmentDto.departmentId) {
        throw new BadRequestException('Department ID is required for Department assignment type')
      }
      // Note: Department validation would require Department model - for now we'll just check if it's provided
    }

    const assignment = await this.prisma.shiftAssignment.create({
      data: {
        projectId: createShiftAssignmentDto.projectId,
        employeeId: createShiftAssignmentDto.employeeId,
        departmentId: createShiftAssignmentDto.departmentId,
        shiftId: createShiftAssignmentDto.shiftId,
        assignmentType: createShiftAssignmentDto.assignmentType,
        startDate: new Date(createShiftAssignmentDto.startDate),
        endDate: createShiftAssignmentDto.endDate ? new Date(createShiftAssignmentDto.endDate) : null,
        isRecurring: createShiftAssignmentDto.isRecurring || false,
        recurringPattern: createShiftAssignmentDto.recurringPattern,
        isActive: createShiftAssignmentDto.isActive !== false,
        assignedBy: createShiftAssignmentDto.assignedBy,
      },
      include: {
        employee: true,
        project: true,
      },
    })

    // Fetch shift details
    const shiftDetails = await this.prisma.shift.findUnique({
      where: { id: assignment.shiftId },
    })

    return this.formatAssignmentResponse(assignment, shiftDetails)
  }

  async findAll(projectId?: string, employeeId?: string, departmentId?: string) {
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (employeeId) where.employeeId = employeeId
    if (departmentId) where.departmentId = departmentId

    const assignments = await this.prisma.shiftAssignment.findMany({
      where,
      include: {
        employee: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch shift details for each assignment
    const shiftIds = [...new Set(assignments.map(a => a.shiftId))]
    const shifts = await this.prisma.shift.findMany({
      where: { id: { in: shiftIds } },
    })
    const shiftMap = new Map(shifts.map(s => [s.id, s]))

    return assignments.map(assignment => 
      this.formatAssignmentResponse(assignment, shiftMap.get(assignment.shiftId))
    )
  }

  async findOne(id: string) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id },
      include: {
        employee: true,
        project: true,
      },
    })

    if (!assignment) {
      throw new NotFoundException('Shift assignment not found')
    }

    const shift = await this.prisma.shift.findUnique({
      where: { id: assignment.shiftId },
    })

    return this.formatAssignmentResponse(assignment, shift)
  }

  async update(id: string, updateShiftAssignmentDto: UpdateShiftAssignmentDto) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('Shift assignment not found')
    }

    const updateData: any = { ...updateShiftAssignmentDto }
    if (updateShiftAssignmentDto.startDate) {
      updateData.startDate = new Date(updateShiftAssignmentDto.startDate)
    }
    if (updateShiftAssignmentDto.endDate !== undefined) {
      updateData.endDate = updateShiftAssignmentDto.endDate ? new Date(updateShiftAssignmentDto.endDate) : null
    }

    const updated = await this.prisma.shiftAssignment.update({
      where: { id },
      data: updateData,
      include: {
        employee: true,
        project: true,
      },
    })

    const shift = await this.prisma.shift.findUnique({
      where: { id: updated.shiftId },
    })

    return this.formatAssignmentResponse(updated, shift)
  }

  async remove(id: string) {
    const assignment = await this.prisma.shiftAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('Shift assignment not found')
    }

    await this.prisma.shiftAssignment.delete({
      where: { id },
    })
  }

  private formatAssignmentResponse(assignment: any, shift?: any) {
    return {
      id: assignment.id,
      projectId: assignment.projectId,
      projectName: assignment.project.name,
      projectCode: assignment.project.code,
      employeeId: assignment.employeeId,
      employeeName: assignment.employee?.name,
      employeeCode: assignment.employee?.employeeId,
      departmentId: assignment.departmentId,
      departmentName: assignment.departmentId, // Would need to fetch from Department model
      shiftId: assignment.shiftId,
      shiftName: shift?.shiftName || '',
      shiftCode: shift?.shiftCode || '',
      assignmentType: assignment.assignmentType,
      startDate: assignment.startDate.toISOString().split('T')[0],
      endDate: assignment.endDate ? assignment.endDate.toISOString().split('T')[0] : null,
      isRecurring: assignment.isRecurring,
      recurringPattern: assignment.recurringPattern,
      isActive: assignment.isActive,
      assignedBy: assignment.assignedBy,
      assignedDate: assignment.assignedDate.toISOString().split('T')[0],
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    }
  }
}
