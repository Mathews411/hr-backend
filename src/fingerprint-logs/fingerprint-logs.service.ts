import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFingerprintLogDto } from './dto/create-fingerprint-log.dto'
import { UpdateFingerprintLogDto } from './dto/update-fingerprint-log.dto'

@Injectable()
export class FingerprintLogsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateFingerprintLogDto) {
    // Verify fingerprint device exists
    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { id: createDto.fingerprintDeviceId },
    })

    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    // If employeeMasterId is provided, verify it exists
    if (createDto.employeeMasterId) {
      const employee = await this.prisma.employeeMaster.findUnique({
        where: { id: createDto.employeeMasterId },
      })
      if (!employee) {
        throw new NotFoundException('Employee not found')
      }
    }

    const log = await this.prisma.fingerprintLog.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        fingerprintDeviceId: createDto.fingerprintDeviceId,
        recognitionTime: createDto.recognitionTime ? new Date(createDto.recognitionTime) : new Date(),
        status: (createDto.status as any) || 'UNKNOWN',
        confidence: createDto.confidence || 0,
        fingerprintIndex: createDto.fingerprintIndex,
        location: createDto.location || device.location,
        remarks: createDto.remarks,
      },
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    return this.formatResponse(log)
  }

  async findAll(
    fingerprintDeviceId?: string,
    employeeMasterId?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    limit?: number,
  ) {
    const where: any = {}

    if (fingerprintDeviceId) where.fingerprintDeviceId = fingerprintDeviceId
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (status) {
      const statusMap: Record<string, string> = {
        'Recognized': 'RECOGNIZED',
        'Failed': 'FAILED',
        'Unknown': 'UNKNOWN',
        'Duplicate': 'DUPLICATE',
      }
      where.status = statusMap[status] || status
    }

    if (startDate || endDate) {
      where.recognitionTime = {}
      if (startDate) where.recognitionTime.gte = new Date(startDate)
      if (endDate) where.recognitionTime.lte = new Date(endDate)
    }

    const logs = await this.prisma.fingerprintLog.findMany({
      where,
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
      orderBy: { recognitionTime: 'desc' },
      take: limit || 100,
    })

    return Promise.all(logs.map(log => this.formatResponse(log)))
  }

  async findRecent(limit: number = 50) {
    const logs = await this.prisma.fingerprintLog.findMany({
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
      orderBy: { recognitionTime: 'desc' },
      take: limit,
    })

    return Promise.all(logs.map(log => this.formatResponse(log)))
  }

  async findOne(id: string) {
    const log = await this.prisma.fingerprintLog.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    if (!log) {
      throw new NotFoundException('Fingerprint log not found')
    }

    return this.formatResponse(log)
  }

  async update(id: string, updateDto: UpdateFingerprintLogDto) {
    const log = await this.prisma.fingerprintLog.findUnique({
      where: { id },
    })

    if (!log) {
      throw new NotFoundException('Fingerprint log not found')
    }

    const updateData: any = {}
    if (updateDto.status) updateData.status = updateDto.status
    if (updateDto.confidence !== undefined) updateData.confidence = updateDto.confidence
    if (updateDto.fingerprintIndex !== undefined) updateData.fingerprintIndex = updateDto.fingerprintIndex
    if (updateDto.remarks !== undefined) updateData.remarks = updateDto.remarks

    const updated = await this.prisma.fingerprintLog.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const log = await this.prisma.fingerprintLog.findUnique({
      where: { id },
    })

    if (!log) {
      throw new NotFoundException('Fingerprint log not found')
    }

    await this.prisma.fingerprintLog.delete({
      where: { id },
    })

    return { message: 'Fingerprint log deleted successfully' }
  }

  async getStatistics(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate || endDate) {
      where.recognitionTime = {}
      if (startDate) where.recognitionTime.gte = new Date(startDate)
      if (endDate) where.recognitionTime.lte = new Date(endDate)
    }

    const logs = await this.prisma.fingerprintLog.findMany({
      where,
    })

    const total = logs.length
    const recognized = logs.filter(l => l.status === 'RECOGNIZED').length
    const failed = logs.filter(l => l.status === 'FAILED').length
    const unknown = logs.filter(l => l.status === 'UNKNOWN').length

    return {
      total,
      recognized,
      failed,
      unknown,
    }
  }

  private async formatResponse(log: any) {
    let employeeName = 'Unknown'
    let employeeCode = ''
    let department = ''

    if (log.employeeMaster) {
      employeeName = `${log.employeeMaster.firstName} ${log.employeeMaster.lastName}`
      employeeCode = log.employeeMaster.employeeCode

      if (log.employeeMaster.departmentId) {
        const dept = await this.prisma.department.findUnique({
          where: { id: log.employeeMaster.departmentId },
        })
        department = dept?.departmentName || ''
      }
    }

    const statusMap: Record<string, string> = {
      'RECOGNIZED': 'Recognized',
      'FAILED': 'Failed',
      'UNKNOWN': 'Unknown',
      'DUPLICATE': 'Duplicate',
    }

    return {
      id: log.id,
      employeeId: log.employeeMasterId || '',
      employeeCode,
      employeeName,
      department,
      recognitionTime: log.recognitionTime.toISOString(),
      status: statusMap[log.status] || log.status,
      confidence: log.confidence,
      fingerprintIndex: log.fingerprintIndex,
      deviceLocation: log.location || log.fingerprintDevice?.location || '',
      remarks: log.remarks,
      createdAt: log.createdAt.toISOString(),
    }
  }
}

