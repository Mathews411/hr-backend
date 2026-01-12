import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateNightShiftAllowanceDto } from './dto/create-night-shift-allowance.dto'
import { UpdateNightShiftAllowanceDto } from './dto/update-night-shift-allowance.dto'

@Injectable()
export class NightShiftAllowancesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNightShiftAllowanceDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    // Calculate hours worked from start and end time if not provided
    let hoursWorked = createDto.hoursWorked
    if (!hoursWorked) {
      const start = new Date(`2000-01-01T${createDto.shiftStartTime}`)
      const end = new Date(`2000-01-01T${createDto.shiftEndTime}`)
      if (end < start) {
        end.setDate(end.getDate() + 1) // Handle overnight shifts
      }
      hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }

    // Calculate allowance amount if not provided (default rate: ₹100 per hour for night shifts)
    const allowanceAmount = createDto.allowanceAmount || hoursWorked * 100

    const allowance = await this.prisma.nightShiftAllowance.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        date: new Date(createDto.date),
        shiftStartTime: createDto.shiftStartTime,
        shiftEndTime: createDto.shiftEndTime,
        hoursWorked: hoursWorked,
        allowanceAmount: allowanceAmount,
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(allowance)
  }

  async findAll(employeeId?: string, startDate?: string, endDate?: string, search?: string) {
    const where: any = {}

    if (employeeId) {
      where.employeeMasterId = employeeId
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
        { remarks: { contains: search, mode: 'insensitive' } },
      ]
    }

    const allowances = await this.prisma.nightShiftAllowance.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return allowances.map((allowance) => this.formatResponse(allowance))
  }

  async findOne(id: string) {
    const allowance = await this.prisma.nightShiftAllowance.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
      },
    })

    if (!allowance) {
      throw new NotFoundException('Night shift allowance not found')
    }

    return this.formatResponse(allowance)
  }

  async update(id: string, updateDto: UpdateNightShiftAllowanceDto) {
    const allowance = await this.prisma.nightShiftAllowance.findUnique({
      where: { id },
    })

    if (!allowance) {
      throw new NotFoundException('Night shift allowance not found')
    }

    const updated = await this.prisma.nightShiftAllowance.update({
      where: { id },
      data: {
        ...(updateDto.date && { date: new Date(updateDto.date) }),
        ...(updateDto.shiftStartTime !== undefined && { shiftStartTime: updateDto.shiftStartTime }),
        ...(updateDto.shiftEndTime !== undefined && { shiftEndTime: updateDto.shiftEndTime }),
        ...(updateDto.allowanceAmount !== undefined && { allowanceAmount: updateDto.allowanceAmount }),
        ...(updateDto.hoursWorked !== undefined && { hoursWorked: updateDto.hoursWorked }),
        ...(updateDto.shiftStartTime !== undefined && updateDto.shiftEndTime !== undefined && !updateDto.hoursWorked && {
          hoursWorked: (() => {
            const start = new Date(`2000-01-01T${updateDto.shiftStartTime}`)
            const end = new Date(`2000-01-01T${updateDto.shiftEndTime}`)
            if (end < start) end.setDate(end.getDate() + 1)
            return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          })(),
        }),
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const allowance = await this.prisma.nightShiftAllowance.findUnique({
      where: { id },
    })

    if (!allowance) {
      throw new NotFoundException('Night shift allowance not found')
    }

    await this.prisma.nightShiftAllowance.delete({
      where: { id },
    })
  }

  private formatResponse(allowance: any) {
    return {
      id: allowance.id,
      employeeMasterId: allowance.employeeMasterId,
      employeeName: allowance.employeeMaster
        ? `${allowance.employeeMaster.firstName} ${allowance.employeeMaster.lastName}`
        : undefined,
      employeeCode: allowance.employeeMaster?.employeeCode,
      department: allowance.employeeMaster?.departmentId,
      date: allowance.date.toISOString().split('T')[0],
      shiftStartTime: allowance.shiftStartTime,
      shiftEndTime: allowance.shiftEndTime,
      hoursWorked: allowance.hoursWorked,
      allowanceAmount: allowance.allowanceAmount,
      status: allowance.status,
    }
  }
}

