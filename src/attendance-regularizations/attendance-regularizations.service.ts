import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAttendanceRegularizationDto } from './dto/create-attendance-regularization.dto'
import { UpdateAttendanceRegularizationDto } from './dto/update-attendance-regularization.dto'

@Injectable()
export class AttendanceRegularizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAttendanceRegularizationDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    // Generate request number
    const year = new Date().getFullYear()
    const count = await this.prisma.attendanceRegularization.count({
      where: {
        requestedDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    })
    const requestNumber = `REG-${year}-${String(count + 1).padStart(4, '0')}`

    const regularization = await this.prisma.attendanceRegularization.create({
      data: {
        requestNumber,
        employeeMasterId: createDto.employeeMasterId,
        date: new Date(createDto.date),
        originalCheckIn: createDto.originalCheckIn,
        originalCheckOut: createDto.originalCheckOut,
        requestedCheckIn: createDto.requestedCheckIn,
        requestedCheckOut: createDto.requestedCheckOut,
        reason: createDto.reason,
        supportingDocument: createDto.supportingDocument,
        status: 'PENDING',
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(regularization)
  }

  async findAll(employeeId?: string, status?: string, startDate?: string, endDate?: string, search?: string) {
    const where: any = {}

    if (employeeId) {
      where.employeeMasterId = employeeId
    }

    if (status) {
      where.status = status.toUpperCase()
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
        { requestNumber: { contains: search, mode: 'insensitive' } },
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { reason: { contains: search, mode: 'insensitive' } },
      ]
    }

    const regularizations = await this.prisma.attendanceRegularization.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: {
        requestedDate: 'desc',
      },
    })

    return regularizations.map((regularization) => this.formatResponse(regularization))
  }

  async findOne(id: string) {
    const regularization = await this.prisma.attendanceRegularization.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
      },
    })

    if (!regularization) {
      throw new NotFoundException('Attendance regularization not found')
    }

    return this.formatResponse(regularization)
  }

  async update(id: string, updateDto: UpdateAttendanceRegularizationDto) {
    const regularization = await this.prisma.attendanceRegularization.findUnique({
      where: { id },
    })

    if (!regularization) {
      throw new NotFoundException('Attendance regularization not found')
    }

    const updated = await this.prisma.attendanceRegularization.update({
      where: { id },
      data: {
        ...(updateDto.date && { date: new Date(updateDto.date) }),
        ...(updateDto.originalCheckIn !== undefined && { originalCheckIn: updateDto.originalCheckIn }),
        ...(updateDto.originalCheckOut !== undefined && { originalCheckOut: updateDto.originalCheckOut }),
        ...(updateDto.requestedCheckIn !== undefined && { requestedCheckIn: updateDto.requestedCheckIn }),
        ...(updateDto.requestedCheckOut !== undefined && { requestedCheckOut: updateDto.requestedCheckOut }),
        ...(updateDto.reason !== undefined && { reason: updateDto.reason }),
        ...(updateDto.supportingDocument !== undefined && { supportingDocument: updateDto.supportingDocument }),
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async approve(id: string) {
    const regularization = await this.prisma.attendanceRegularization.findUnique({
      where: { id },
    })

    if (!regularization) {
      throw new NotFoundException('Attendance regularization not found')
    }

    if (regularization.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved')
    }

    const updated = await this.prisma.attendanceRegularization.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedDate: new Date(),
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async reject(id: string, rejectionReason: string) {
    const regularization = await this.prisma.attendanceRegularization.findUnique({
      where: { id },
    })

    if (!regularization) {
      throw new NotFoundException('Attendance regularization not found')
    }

    if (regularization.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be rejected')
    }

    const updated = await this.prisma.attendanceRegularization.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason,
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const regularization = await this.prisma.attendanceRegularization.findUnique({
      where: { id },
    })

    if (!regularization) {
      throw new NotFoundException('Attendance regularization not found')
    }

    await this.prisma.attendanceRegularization.delete({
      where: { id },
    })
  }

  private formatResponse(regularization: any) {
    return {
      id: regularization.id,
      requestNumber: regularization.requestNumber,
      employeeMasterId: regularization.employeeMasterId,
      employeeName: regularization.employeeMaster
        ? `${regularization.employeeMaster.firstName} ${regularization.employeeMaster.lastName}`
        : undefined,
      employeeCode: regularization.employeeMaster?.employeeCode,
      department: regularization.employeeMaster?.departmentId,
      date: regularization.date.toISOString().split('T')[0],
      originalCheckIn: regularization.originalCheckIn,
      originalCheckOut: regularization.originalCheckOut,
      requestedCheckIn: regularization.requestedCheckIn,
      requestedCheckOut: regularization.requestedCheckOut,
      reason: regularization.reason,
      supportingDocument: regularization.supportingDocument,
      status: regularization.status,
      requestedDate: regularization.requestedDate.toISOString().split('T')[0],
      approvedBy: regularization.approvedBy,
      approvedDate: regularization.approvedDate?.toISOString().split('T')[0],
      rejectionReason: regularization.rejectionReason,
    }
  }
}

