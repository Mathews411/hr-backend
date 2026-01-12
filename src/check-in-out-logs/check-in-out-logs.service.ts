import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCheckInOutLogDto } from './dto/create-check-in-out-log.dto'
import { UpdateCheckInOutLogDto } from './dto/update-check-in-out-log.dto'

@Injectable()
export class CheckInOutLogsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCheckInOutLogDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const log = await this.prisma.checkInOutLog.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        logDate: new Date(createDto.logDate),
        checkInTime: createDto.checkInTime,
        checkOutTime: createDto.checkOutTime,
        checkInLocation: createDto.checkInLocation,
        checkOutLocation: createDto.checkOutLocation,
        checkInMethod: createDto.checkInMethod,
        checkOutMethod: createDto.checkOutMethod,
        workingHours: createDto.workingHours,
        status: createDto.status || 'CHECKED_IN',
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(log)
  }

  async findAll(employeeId?: string, startDate?: string, endDate?: string, status?: string, search?: string) {
    const where: any = {}

    if (employeeId) {
      where.employeeMasterId = employeeId
    }

    if (startDate || endDate) {
      where.logDate = {}
      if (startDate) {
        where.logDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.logDate.lte = new Date(endDate)
      }
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { checkInLocation: { contains: search, mode: 'insensitive' } },
        { checkOutLocation: { contains: search, mode: 'insensitive' } },
      ]
    }

    const logs = await this.prisma.checkInOutLog.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: {
        logDate: 'desc',
      },
    })

    return logs.map((log) => this.formatResponse(log))
  }

  async findOne(id: string) {
    const log = await this.prisma.checkInOutLog.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
      },
    })

    if (!log) {
      throw new NotFoundException('Check-in/out log not found')
    }

    return this.formatResponse(log)
  }

  async update(id: string, updateDto: UpdateCheckInOutLogDto) {
    const log = await this.prisma.checkInOutLog.findUnique({
      where: { id },
    })

    if (!log) {
      throw new NotFoundException('Check-in/out log not found')
    }

    const updated = await this.prisma.checkInOutLog.update({
      where: { id },
      data: {
        ...(updateDto.logDate && { logDate: new Date(updateDto.logDate) }),
        ...(updateDto.checkInTime !== undefined && { checkInTime: updateDto.checkInTime }),
        ...(updateDto.checkOutTime !== undefined && { checkOutTime: updateDto.checkOutTime }),
        ...(updateDto.checkInLocation !== undefined && { checkInLocation: updateDto.checkInLocation }),
        ...(updateDto.checkOutLocation !== undefined && { checkOutLocation: updateDto.checkOutLocation }),
        ...(updateDto.checkInMethod && { checkInMethod: updateDto.checkInMethod }),
        ...(updateDto.checkOutMethod !== undefined && { checkOutMethod: updateDto.checkOutMethod }),
        ...(updateDto.workingHours !== undefined && { workingHours: updateDto.workingHours }),
        ...(updateDto.status && { status: updateDto.status }),
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const log = await this.prisma.checkInOutLog.findUnique({
      where: { id },
    })

    if (!log) {
      throw new NotFoundException('Check-in/out log not found')
    }

    await this.prisma.checkInOutLog.delete({
      where: { id },
    })
  }

  private formatResponse(log: any) {
    return {
      id: log.id,
      employeeMasterId: log.employeeMasterId,
      employeeName: log.employeeMaster
        ? `${log.employeeMaster.firstName} ${log.employeeMaster.lastName}`
        : undefined,
      employeeCode: log.employeeMaster?.employeeCode,
      department: log.employeeMaster?.departmentId,
      logDate: log.logDate.toISOString().split('T')[0],
      checkInTime: log.checkInTime,
      checkOutTime: log.checkOutTime,
      checkInLocation: log.checkInLocation,
      checkOutLocation: log.checkOutLocation,
      checkInMethod: log.checkInMethod,
      checkOutMethod: log.checkOutMethod,
      workingHours: log.workingHours,
      status: log.status,
    }
  }
}

