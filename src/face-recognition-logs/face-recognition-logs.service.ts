import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFaceRecognitionLogDto } from './dto/create-face-recognition-log.dto'
import { UpdateFaceRecognitionLogDto } from './dto/update-face-recognition-log.dto'

@Injectable()
export class FaceRecognitionLogsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateFaceRecognitionLogDto) {
    // Verify camera device exists
    const cameraDevice = await this.prisma.cameraDevice.findUnique({
      where: { id: createDto.cameraDeviceId },
    })

    if (!cameraDevice) {
      throw new NotFoundException('Camera device not found')
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

    const log = await this.prisma.faceRecognitionLog.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        cameraDeviceId: createDto.cameraDeviceId,
        recognitionTime: createDto.recognitionTime ? new Date(createDto.recognitionTime) : new Date(),
        status: (createDto.status as any) || 'UNKNOWN',
        confidence: createDto.confidence,
        imageUrl: createDto.imageUrl,
        location: createDto.location || cameraDevice.location,
        remarks: createDto.remarks,
      },
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
    })

    return this.formatResponse(log)
  }

  async findAll(
    cameraDeviceId?: string,
    employeeMasterId?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    limit?: number,
  ) {
    const where: any = {}

    if (cameraDeviceId) where.cameraDeviceId = cameraDeviceId
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (status) {
      const statusMap: Record<string, string> = {
        'Recognized': 'RECOGNIZED',
        'Failed': 'FAILED',
        'Unknown': 'UNKNOWN',
      }
      where.status = statusMap[status] || status
    }

    if (startDate || endDate) {
      where.recognitionTime = {}
      if (startDate) where.recognitionTime.gte = new Date(startDate)
      if (endDate) where.recognitionTime.lte = new Date(endDate)
    }

    const logs = await this.prisma.faceRecognitionLog.findMany({
      where,
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
      orderBy: { recognitionTime: 'desc' },
      take: limit || 100,
    })

    return Promise.all(logs.map(log => this.formatResponse(log)))
  }

  async findRecent(limit: number = 50) {
    const logs = await this.prisma.faceRecognitionLog.findMany({
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
      orderBy: { recognitionTime: 'desc' },
      take: limit,
    })

    return Promise.all(logs.map(log => this.formatResponse(log)))
  }

  async findOne(id: string) {
    const log = await this.prisma.faceRecognitionLog.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
    })

    if (!log) {
      throw new NotFoundException('Face recognition log not found')
    }

    return this.formatResponse(log)
  }

  async update(id: string, updateDto: UpdateFaceRecognitionLogDto) {
    const log = await this.prisma.faceRecognitionLog.findUnique({
      where: { id },
    })

    if (!log) {
      throw new NotFoundException('Face recognition log not found')
    }

    const updateData: any = {}
    if (updateDto.employeeMasterId !== undefined) updateData.employeeMasterId = updateDto.employeeMasterId
    if (updateDto.cameraDeviceId !== undefined) updateData.cameraDeviceId = updateDto.cameraDeviceId
    if (updateDto.recognitionTime !== undefined) updateData.recognitionTime = new Date(updateDto.recognitionTime)
    if (updateDto.status !== undefined) updateData.status = updateDto.status
    if (updateDto.confidence !== undefined) updateData.confidence = updateDto.confidence
    if (updateDto.imageUrl !== undefined) updateData.imageUrl = updateDto.imageUrl
    if (updateDto.location !== undefined) updateData.location = updateDto.location
    if (updateDto.remarks !== undefined) updateData.remarks = updateDto.remarks

    const updated = await this.prisma.faceRecognitionLog.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const log = await this.prisma.faceRecognitionLog.findUnique({
      where: { id },
    })

    if (!log) {
      throw new NotFoundException('Face recognition log not found')
    }

    await this.prisma.faceRecognitionLog.delete({
      where: { id },
    })

    return { message: 'Face recognition log deleted successfully' }
  }

  async getStatistics(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate || endDate) {
      where.recognitionTime = {}
      if (startDate) where.recognitionTime.gte = new Date(startDate)
      if (endDate) where.recognitionTime.lte = new Date(endDate)
    }

    const [total, recognized, failed, unknown] = await Promise.all([
      this.prisma.faceRecognitionLog.count({ where }),
      this.prisma.faceRecognitionLog.count({ where: { ...where, status: 'RECOGNIZED' } }),
      this.prisma.faceRecognitionLog.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.faceRecognitionLog.count({ where: { ...where, status: 'UNKNOWN' } }),
    ])

    return { total, recognized, failed, unknown }
  }

  private async formatResponse(log: any) {
    const statusMap: Record<string, string> = {
      'RECOGNIZED': 'Recognized',
      'FAILED': 'Failed',
      'UNKNOWN': 'Unknown',
    }

    let departmentName = 'Not assigned'
    let designationName = 'Not assigned'

    if (log.employeeMaster) {
      if (log.employeeMaster.departmentId) {
        const department = await this.prisma.department.findUnique({
          where: { id: log.employeeMaster.departmentId },
        })
        departmentName = department?.departmentName || 'Not assigned'
      }

      if (log.employeeMaster.designationId) {
        const designation = await this.prisma.designation.findUnique({
          where: { id: log.employeeMaster.designationId },
        })
        designationName = designation?.designationName || 'Not assigned'
      }
    }

    return {
      id: log.id,
      employeeId: log.employeeMasterId || '',
      employeeCode: log.employeeMaster?.employeeCode || '',
      employeeName: log.employeeMaster
        ? `${log.employeeMaster.firstName} ${log.employeeMaster.lastName}`
        : 'Unknown',
      department: departmentName,
      designation: designationName,
      cameraLocation: log.location || log.cameraDevice?.location || 'Unknown',
      recognitionTime: log.recognitionTime.toISOString(),
      status: statusMap[log.status] || log.status,
      confidence: log.confidence,
      imageUrl: log.imageUrl,
      cameraDeviceId: log.cameraDeviceId,
      createdAt: log.createdAt.toISOString(),
    }
  }
}

