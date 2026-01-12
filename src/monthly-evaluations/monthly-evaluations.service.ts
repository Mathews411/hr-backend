import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMonthlyEvaluationDto } from './dto/create-monthly-evaluation.dto'
import { UpdateMonthlyEvaluationDto } from './dto/update-monthly-evaluation.dto'

@Injectable()
export class MonthlyEvaluationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateMonthlyEvaluationDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const evaluation = await this.prisma.monthlyEvaluation.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        evaluationMonth: createDto.evaluationMonth,
        kpiCount: createDto.kpiCount || 0,
        totalScore: createDto.totalScore || 0,
        maxScore: createDto.maxScore || 0,
        percentage: createDto.percentage || 0,
        status: createDto.status || 'PENDING',
      },
      include: {
        employeeMaster: true,
        kpiEvaluations: {
          include: {
            kpiAssignment: {
              include: {
                kpi: true,
              },
            },
          },
        },
      },
    })

    return this.formatResponse(evaluation)
  }

  async findAll(month?: string, status?: string, search?: string) {
    const where: any = {}

    if (month) {
      where.evaluationMonth = month
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace(' ', '_')
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const evaluations = await this.prisma.monthlyEvaluation.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: { evaluationMonth: 'desc' },
    })

    return evaluations.map(evaluation => this.formatResponse(evaluation))
  }

  async findOne(id: string) {
    const evaluation = await this.prisma.monthlyEvaluation.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        kpiEvaluations: {
          include: {
            kpiAssignment: {
              include: {
                kpi: true,
              },
            },
          },
        },
      },
    })

    if (!evaluation) {
      throw new NotFoundException('Monthly evaluation not found')
    }

    return this.formatResponse(evaluation)
  }

  async update(id: string, updateDto: UpdateMonthlyEvaluationDto) {
    const evaluation = await this.prisma.monthlyEvaluation.findUnique({
      where: { id },
    })

    if (!evaluation) {
      throw new NotFoundException('Monthly evaluation not found')
    }

    const updateData: any = { ...updateDto }
    
    if (updateDto.evaluatedDate) {
      updateData.evaluatedDate = new Date(updateDto.evaluatedDate)
    }
    
    if (updateDto.approvedDate) {
      updateData.approvedDate = new Date(updateDto.approvedDate)
    }

    const updated = await this.prisma.monthlyEvaluation.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const evaluation = await this.prisma.monthlyEvaluation.findUnique({
      where: { id },
    })

    if (!evaluation) {
      throw new NotFoundException('Monthly evaluation not found')
    }

    await this.prisma.monthlyEvaluation.delete({
      where: { id },
    })

    return { message: 'Monthly evaluation deleted successfully' }
  }

  private formatResponse(evaluation: any) {
    const employee = evaluation.employeeMaster
    
    if (!employee) {
      // If employeeMaster is not loaded, return minimal data
      return {
        id: evaluation.id,
        employeeId: evaluation.employeeMasterId,
        employeeName: 'Unknown Employee',
        employeeCode: '',
        department: '',
        designation: '',
        evaluationMonth: evaluation.evaluationMonth,
        kpiCount: evaluation.kpiCount,
        totalScore: evaluation.totalScore,
        maxScore: evaluation.maxScore,
        percentage: evaluation.percentage,
        status: evaluation.status,
        evaluatedBy: evaluation.evaluatedBy,
        evaluatedDate: evaluation.evaluatedDate?.toISOString().split('T')[0],
        approvedBy: evaluation.approvedBy,
        approvedDate: evaluation.approvedDate?.toISOString().split('T')[0],
        createdAt: evaluation.createdAt.toISOString(),
        updatedAt: evaluation.updatedAt.toISOString(),
      }
    }
    
    const firstName = employee.firstName || ''
    const lastName = employee.lastName || ''
    // Construct full name, never use employeeId
    const fullName = `${firstName} ${lastName}`.trim()
    const employeeName = fullName || employee.employeeCode || 'Unknown Employee'
    const employeeCode = employee.employeeCode || ''
    
    return {
      id: evaluation.id,
      employeeId: evaluation.employeeMasterId, // Keep for internal use, but never display
      employeeName: employeeName, // Always the name, never the ID
      employeeCode: employeeCode, // Only employeeCode, never employeeId
      department: employee.departmentId || '',
      designation: employee.designationId || '',
      evaluationMonth: evaluation.evaluationMonth,
      kpiCount: evaluation.kpiCount,
      totalScore: evaluation.totalScore,
      maxScore: evaluation.maxScore,
      percentage: evaluation.percentage,
      status: evaluation.status,
      evaluatedBy: evaluation.evaluatedBy,
      evaluatedDate: evaluation.evaluatedDate?.toISOString().split('T')[0],
      approvedBy: evaluation.approvedBy,
      approvedDate: evaluation.approvedDate?.toISOString().split('T')[0],
      createdAt: evaluation.createdAt.toISOString(),
      updatedAt: evaluation.updatedAt.toISOString(),
    }
  }
}

