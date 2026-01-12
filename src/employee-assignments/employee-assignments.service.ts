import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmployeeAssignmentDto } from './dto/create-employee-assignment.dto'
import { UpdateEmployeeAssignmentDto } from './dto/update-employee-assignment.dto'
import { EmployeeAssignmentStatus } from '@prisma/client'

@Injectable()
export class EmployeeAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeAssignmentDto: CreateEmployeeAssignmentDto) {
    // Check if employee exists (could be Employee or EmployeeMaster ID)
    let employee = await this.prisma.employee.findUnique({
      where: { id: createEmployeeAssignmentDto.employeeId },
    })

    // If not found, try to find/create from EmployeeMaster
    if (!employee) {
      const employeeMaster = await this.prisma.employeeMaster.findUnique({
        where: { id: createEmployeeAssignmentDto.employeeId },
      })

      if (!employeeMaster) {
        throw new NotFoundException('Employee not found')
      }

      // Check if Employee record exists with this employeeCode
      employee = await this.prisma.employee.findUnique({
        where: { employeeId: employeeMaster.employeeCode },
      })

      // Create Employee record if it doesn't exist
      if (!employee) {
        employee = await this.prisma.employee.create({
          data: {
            employeeId: employeeMaster.employeeCode,
            name: `${employeeMaster.firstName} ${employeeMaster.lastName}`,
            email: employeeMaster.email,
            phone: employeeMaster.phone,
            department: employeeMaster.departmentId || null,
            designation: employeeMaster.designationId || null,
            status: employeeMaster.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          },
        })
      }
    }

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createEmployeeAssignmentDto.projectId },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // Check for existing active assignment (use the Employee.id, not EmployeeMaster.id)
    const existingAssignment = await this.prisma.employeeAssignment.findFirst({
      where: {
        employeeId: employee.id, // Use the Employee.id, not the EmployeeMaster.id
        projectId: createEmployeeAssignmentDto.projectId,
        status: EmployeeAssignmentStatus.ACTIVE,
      },
    })

    if (existingAssignment) {
      throw new ConflictException('Employee already has an active assignment to this project')
    }

    const assignment = await this.prisma.employeeAssignment.create({
      data: {
        employeeId: employee.id, // Use the Employee.id, not the EmployeeMaster.id
        projectId: createEmployeeAssignmentDto.projectId,
        role: createEmployeeAssignmentDto.role,
        allocationPercentage: createEmployeeAssignmentDto.allocationPercentage,
        startDate: new Date(createEmployeeAssignmentDto.startDate),
        endDate: createEmployeeAssignmentDto.endDate ? new Date(createEmployeeAssignmentDto.endDate) : null,
        hourlyRate: createEmployeeAssignmentDto.hourlyRate,
        status: createEmployeeAssignmentDto.status || EmployeeAssignmentStatus.ACTIVE,
        assignedBy: createEmployeeAssignmentDto.assignedBy,
      },
      include: {
        employee: true,
        project: true,
      },
    })

    return await this.formatAssignmentResponse(assignment)
  }

  async findAll(employeeId?: string, projectId?: string, status?: string) {
    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (projectId) where.projectId = projectId
    if (status) where.status = status

    const assignments = await this.prisma.employeeAssignment.findMany({
      where,
      include: {
        employee: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return Promise.all(assignments.map(assignment => this.formatAssignmentResponse(assignment)))
  }

  async findOne(id: string) {
    const assignment = await this.prisma.employeeAssignment.findUnique({
      where: { id },
      include: {
        employee: true,
        project: true,
      },
    })

    if (!assignment) {
      throw new NotFoundException('Employee assignment not found')
    }

    return await this.formatAssignmentResponse(assignment)
  }

  async update(id: string, updateEmployeeAssignmentDto: UpdateEmployeeAssignmentDto) {
    const assignment = await this.prisma.employeeAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('Employee assignment not found')
    }

    const updated = await this.prisma.employeeAssignment.update({
      where: { id },
      data: {
        ...updateEmployeeAssignmentDto,
        startDate: updateEmployeeAssignmentDto.startDate ? new Date(updateEmployeeAssignmentDto.startDate) : undefined,
        endDate: updateEmployeeAssignmentDto.endDate ? new Date(updateEmployeeAssignmentDto.endDate) : undefined,
      },
      include: {
        employee: true,
        project: true,
      },
    })

    return await this.formatAssignmentResponse(updated)
  }

  async remove(id: string) {
    const assignment = await this.prisma.employeeAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('Employee assignment not found')
    }

    await this.prisma.employeeAssignment.delete({
      where: { id },
    })
  }

  private async formatAssignmentResponse(assignment: any) {
    // Fetch department name if department ID exists
    let departmentName: string = ''
    if (assignment.employee.department) {
      try {
        const department = await this.prisma.department.findUnique({
          where: { id: assignment.employee.department },
          select: { departmentName: true },
        })
        departmentName = department?.departmentName || assignment.employee.department
      } catch (error) {
        // If department lookup fails, use the ID as fallback
        departmentName = assignment.employee.department
      }
    }

    // Fetch designation name if designation ID exists
    let designationName: string = ''
    if (assignment.employee.designation) {
      try {
        const designation = await this.prisma.designation.findUnique({
          where: { id: assignment.employee.designation },
          select: { designationName: true },
        })
        designationName = designation?.designationName || assignment.employee.designation
      } catch (error) {
        // If designation lookup fails, use the ID as fallback
        designationName = assignment.employee.designation
      }
    }

    return {
      id: assignment.id,
      employeeId: assignment.employeeId,
      employeeName: assignment.employee.name,
      employeeCode: assignment.employee.employeeId,
      designation: designationName || assignment.employee.designation || '',
      department: departmentName || assignment.employee.department || '',
      projectId: assignment.projectId,
      projectName: assignment.project.name,
      projectCode: assignment.project.code,
      role: assignment.role,
      allocationPercentage: assignment.allocationPercentage,
      startDate: assignment.startDate.toISOString().split('T')[0],
      endDate: assignment.endDate ? assignment.endDate.toISOString().split('T')[0] : null,
      hourlyRate: assignment.hourlyRate,
      status: assignment.status === EmployeeAssignmentStatus.ACTIVE ? 'Active' :
              assignment.status === EmployeeAssignmentStatus.COMPLETED ? 'Completed' :
              assignment.status === EmployeeAssignmentStatus.ON_HOLD ? 'On Hold' : 'Cancelled',
      assignedDate: assignment.assignedDate.toISOString().split('T')[0],
      assignedBy: assignment.assignedBy,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    }
  }
}
