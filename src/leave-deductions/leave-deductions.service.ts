import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeaveDeductionDto } from './dto/create-leave-deduction.dto'
import { UpdateLeaveDeductionDto } from './dto/update-leave-deduction.dto'

@Injectable()
export class LeaveDeductionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLeaveDeductionDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const deduction = await this.prisma.leaveDeduction.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        leaveType: createDto.leaveType,
        date: new Date(createDto.date),
        daysDeducted: createDto.daysDeducted,
        reason: createDto.reason,
        approvedBy: createDto.approvedBy,
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(deduction)
  }

  async findAll(employeeId?: string, leaveType?: string, startDate?: string, endDate?: string, search?: string) {
    const where: any = {}

    if (employeeId) {
      where.employeeMasterId = employeeId
    }

    if (leaveType) {
      where.leaveType = leaveType
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
        { leaveType: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
      ]
    }

    const deductions = await this.prisma.leaveDeduction.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return deductions.map((deduction) => this.formatResponse(deduction))
  }

  async findOne(id: string) {
    const deduction = await this.prisma.leaveDeduction.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
      },
    })

    if (!deduction) {
      throw new NotFoundException('Leave deduction not found')
    }

    return this.formatResponse(deduction)
  }

  async update(id: string, updateDto: UpdateLeaveDeductionDto) {
    const deduction = await this.prisma.leaveDeduction.findUnique({
      where: { id },
    })

    if (!deduction) {
      throw new NotFoundException('Leave deduction not found')
    }

    const updated = await this.prisma.leaveDeduction.update({
      where: { id },
      data: {
        ...(updateDto.leaveType && { leaveType: updateDto.leaveType }),
        ...(updateDto.date && { date: new Date(updateDto.date) }),
        ...(updateDto.daysDeducted !== undefined && { daysDeducted: updateDto.daysDeducted }),
        ...(updateDto.reason !== undefined && { reason: updateDto.reason }),
        ...(updateDto.approvedBy !== undefined && { approvedBy: updateDto.approvedBy }),
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const deduction = await this.prisma.leaveDeduction.findUnique({
      where: { id },
    })

    if (!deduction) {
      throw new NotFoundException('Leave deduction not found')
    }

    await this.prisma.leaveDeduction.delete({
      where: { id },
    })
  }

  private formatResponse(deduction: any) {
    return {
      id: deduction.id,
      employeeMasterId: deduction.employeeMasterId,
      employeeName: deduction.employeeMaster
        ? `${deduction.employeeMaster.firstName} ${deduction.employeeMaster.lastName}`
        : undefined,
      employeeCode: deduction.employeeMaster?.employeeCode,
      department: deduction.employeeMaster?.departmentId,
      leaveType: deduction.leaveType,
      date: deduction.date.toISOString().split('T')[0],
      daysDeducted: deduction.daysDeducted,
      reason: deduction.reason,
      approvedBy: deduction.approvedBy,
      status: deduction.status,
    }
  }
}

