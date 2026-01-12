import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDailyAttendanceDto } from './dto/create-daily-attendance.dto'
import { UpdateDailyAttendanceDto } from './dto/update-daily-attendance.dto'

@Injectable()
export class DailyAttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateDailyAttendanceDto) {
    // Verify employee exists
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const attendance = await this.prisma.dailyAttendance.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        date: new Date(createDto.date),
        checkIn: createDto.checkIn,
        checkOut: createDto.checkOut,
        workingHours: createDto.workingHours,
        status: createDto.status || 'ABSENT',
        location: createDto.location,
        remarks: createDto.remarks,
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(attendance)
  }

  async findAll(employeeId?: string, date?: string, status?: string, departmentId?: string, search?: string) {
    const where: any = {}

    if (employeeId) {
      where.employeeMasterId = employeeId
    }

    if (date) {
      where.date = new Date(date)
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    if (departmentId) {
      where.employeeMaster = {
        departmentId: departmentId,
      }
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { location: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ]
    }

    const attendances = await this.prisma.dailyAttendance.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return attendances.map((attendance) => this.formatResponse(attendance))
  }

  async findOne(id: string) {
    const attendance = await this.prisma.dailyAttendance.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
      },
    })

    if (!attendance) {
      throw new NotFoundException('Daily attendance not found')
    }

    return this.formatResponse(attendance)
  }

  async update(id: string, updateDto: UpdateDailyAttendanceDto) {
    const attendance = await this.prisma.dailyAttendance.findUnique({
      where: { id },
    })

    if (!attendance) {
      throw new NotFoundException('Daily attendance not found')
    }

    const updated = await this.prisma.dailyAttendance.update({
      where: { id },
      data: {
        ...(updateDto.date && { date: new Date(updateDto.date) }),
        ...(updateDto.checkIn !== undefined && { checkIn: updateDto.checkIn }),
        ...(updateDto.checkOut !== undefined && { checkOut: updateDto.checkOut }),
        ...(updateDto.workingHours !== undefined && { workingHours: updateDto.workingHours }),
        ...(updateDto.status && { status: updateDto.status }),
        ...(updateDto.location !== undefined && { location: updateDto.location }),
        ...(updateDto.remarks !== undefined && { remarks: updateDto.remarks }),
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const attendance = await this.prisma.dailyAttendance.findUnique({
      where: { id },
    })

    if (!attendance) {
      throw new NotFoundException('Daily attendance not found')
    }

    await this.prisma.dailyAttendance.delete({
      where: { id },
    })
  }

  private formatResponse(attendance: any) {
    return {
      id: attendance.id,
      employeeMasterId: attendance.employeeMasterId,
      employeeName: attendance.employeeMaster
        ? `${attendance.employeeMaster.firstName} ${attendance.employeeMaster.lastName}`
        : undefined,
      employeeCode: attendance.employeeMaster?.employeeCode,
      department: attendance.employeeMaster?.departmentId,
      designation: attendance.employeeMaster?.designationId,
      date: attendance.date.toISOString().split('T')[0],
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      workingHours: attendance.workingHours,
      status: attendance.status,
      location: attendance.location,
      remarks: attendance.remarks,
    }
  }
}

