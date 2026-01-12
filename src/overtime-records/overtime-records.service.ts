import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOvertimeRecordDto } from './dto/create-overtime-record.dto'
import { UpdateOvertimeRecordDto } from './dto/update-overtime-record.dto'

@Injectable()
export class OvertimeRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateOvertimeRecordDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    if (createDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: createDto.projectId },
      })

      if (!project) {
        throw new NotFoundException('Project not found')
      }
    }

    const record = await this.prisma.overtimeRecord.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        date: new Date(createDto.date),
        startTime: createDto.startTime,
        endTime: createDto.endTime,
        totalHours: createDto.totalHours,
        overtimeType: createDto.overtimeType,
        reason: createDto.reason,
        projectId: createDto.projectId,
        status: 'PENDING',
      },
      include: {
        employeeMaster: true,
        project: true,
      },
    })

    return this.formatResponse(record)
  }

  async findAll(employeeId?: string, startDate?: string, endDate?: string, status?: string, search?: string) {
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

    if (status) {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { reason: { contains: search, mode: 'insensitive' } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const records = await this.prisma.overtimeRecord.findMany({
      where,
      include: {
        employeeMaster: true,
        project: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return records.map((record) => this.formatResponse(record))
  }

  async findOne(id: string) {
    const record = await this.prisma.overtimeRecord.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        project: true,
      },
    })

    if (!record) {
      throw new NotFoundException('Overtime record not found')
    }

    return this.formatResponse(record)
  }

  async update(id: string, updateDto: UpdateOvertimeRecordDto) {
    const record = await this.prisma.overtimeRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Overtime record not found')
    }

    if (updateDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: updateDto.projectId },
      })

      if (!project) {
        throw new NotFoundException('Project not found')
      }
    }

    const updated = await this.prisma.overtimeRecord.update({
      where: { id },
      data: {
        ...(updateDto.date && { date: new Date(updateDto.date) }),
        ...(updateDto.startTime !== undefined && { startTime: updateDto.startTime }),
        ...(updateDto.endTime !== undefined && { endTime: updateDto.endTime }),
        ...(updateDto.totalHours !== undefined && { totalHours: updateDto.totalHours }),
        ...(updateDto.overtimeType && { overtimeType: updateDto.overtimeType }),
        ...(updateDto.reason !== undefined && { reason: updateDto.reason }),
        ...(updateDto.projectId !== undefined && { projectId: updateDto.projectId }),
      },
      include: {
        employeeMaster: true,
        project: true,
      },
    })

    return this.formatResponse(updated)
  }

  async approve(id: string) {
    const record = await this.prisma.overtimeRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Overtime record not found')
    }

    if (record.status !== 'PENDING') {
      throw new BadRequestException('Only pending records can be approved')
    }

    const updated = await this.prisma.overtimeRecord.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedDate: new Date(),
      },
      include: {
        employeeMaster: true,
        project: true,
      },
    })

    return this.formatResponse(updated)
  }

  async reject(id: string, rejectionReason: string) {
    const record = await this.prisma.overtimeRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Overtime record not found')
    }

    if (record.status !== 'PENDING') {
      throw new BadRequestException('Only pending records can be rejected')
    }

    const updated = await this.prisma.overtimeRecord.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
      include: {
        employeeMaster: true,
        project: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const record = await this.prisma.overtimeRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('Overtime record not found')
    }

    await this.prisma.overtimeRecord.delete({
      where: { id },
    })
  }

  private formatResponse(record: any) {
    return {
      id: record.id,
      employeeMasterId: record.employeeMasterId,
      employeeName: record.employeeMaster
        ? `${record.employeeMaster.firstName} ${record.employeeMaster.lastName}`
        : undefined,
      employeeCode: record.employeeMaster?.employeeCode,
      department: record.employeeMaster?.departmentId,
      date: record.date.toISOString().split('T')[0],
      startTime: record.startTime,
      endTime: record.endTime,
      totalHours: record.totalHours,
      overtimeType: record.overtimeType,
      reason: record.reason,
      projectId: record.projectId,
      projectName: record.project?.name,
      status: record.status,
      requestedDate: record.requestedDate.toISOString().split('T')[0],
      approvedBy: record.approvedBy,
      approvedDate: record.approvedDate?.toISOString().split('T')[0],
      overtimeAmount: record.overtimeAmount,
    }
  }
}

