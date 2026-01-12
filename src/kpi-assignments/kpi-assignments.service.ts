import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateKpiAssignmentDto } from './dto/create-kpi-assignment.dto'
import { UpdateKpiAssignmentDto } from './dto/update-kpi-assignment.dto'

@Injectable()
export class KpiAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateKpiAssignmentDto) {
    // Verify employee exists
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    // Verify KPI exists
    const kpi = await this.prisma.kPI.findUnique({
      where: { id: createDto.kpiId },
    })

    if (!kpi) {
      throw new NotFoundException('KPI not found')
    }

    // Check if assignment already exists for this employee, KPI, and period
    const existing = await this.prisma.kPIAssignment.findFirst({
      where: {
        employeeMasterId: createDto.employeeMasterId,
        kpiId: createDto.kpiId,
        evaluationPeriod: createDto.evaluationPeriod,
        status: 'ACTIVE',
      },
    })

    if (existing) {
      throw new ConflictException('KPI already assigned to this employee for this evaluation period')
    }

    const assignment = await this.prisma.kPIAssignment.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        kpiId: createDto.kpiId,
        targetValue: createDto.targetValue,
        weightage: createDto.weightage,
        evaluationPeriod: createDto.evaluationPeriod,
        status: createDto.status || 'ACTIVE',
      },
      include: {
        employeeMaster: true,
        kpi: true,
      },
    })

    return this.formatResponse(assignment)
  }

  async findAll(employeeId?: string, status?: string, search?: string) {
    const where: any = {}

    if (employeeId && employeeId !== 'all') {
      where.employeeMasterId = employeeId
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { kpi: { kpiName: { contains: search, mode: 'insensitive' } } },
        { kpi: { kpiCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const assignments = await this.prisma.kPIAssignment.findMany({
      where,
      include: {
        employeeMaster: true,
        kpi: true,
      },
      orderBy: { assignedDate: 'desc' },
    })

    return assignments.map(assignment => this.formatResponse(assignment))
  }

  async findOne(id: string) {
    const assignment = await this.prisma.kPIAssignment.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        kpi: true,
      },
    })

    if (!assignment) {
      throw new NotFoundException('KPI assignment not found')
    }

    return this.formatResponse(assignment)
  }

  async update(id: string, updateDto: UpdateKpiAssignmentDto) {
    const assignment = await this.prisma.kPIAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('KPI assignment not found')
    }

    const updated = await this.prisma.kPIAssignment.update({
      where: { id },
      data: updateDto,
      include: {
        employeeMaster: true,
        kpi: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const assignment = await this.prisma.kPIAssignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      throw new NotFoundException('KPI assignment not found')
    }

    await this.prisma.kPIAssignment.delete({
      where: { id },
    })

    return { message: 'KPI assignment removed successfully' }
  }

  private formatResponse(assignment: any) {
    return {
      id: assignment.id,
      employeeId: assignment.employeeMasterId,
      employeeName: `${assignment.employeeMaster?.firstName || ''} ${assignment.employeeMaster?.lastName || ''}`.trim(),
      employeeCode: assignment.employeeMaster?.employeeCode,
      department: assignment.employeeMaster?.departmentId,
      designation: assignment.employeeMaster?.designationId,
      kpiId: assignment.kpiId,
      kpiName: assignment.kpi?.kpiName,
      kpiCode: assignment.kpi?.kpiCode,
      targetValue: assignment.targetValue,
      weightage: assignment.weightage,
      assignedDate: assignment.assignedDate.toISOString().split('T')[0],
      evaluationPeriod: assignment.evaluationPeriod,
      assignedBy: assignment.assignedBy,
      status: assignment.status,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
    }
  }
}

