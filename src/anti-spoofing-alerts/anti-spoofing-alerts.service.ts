import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAntiSpoofingAlertDto } from './dto/create-anti-spoofing-alert.dto'
import { UpdateAntiSpoofingAlertDto } from './dto/update-anti-spoofing-alert.dto'
import { AntiSpoofingAlertStatus } from './dto/create-anti-spoofing-alert.dto'

@Injectable()
export class AntiSpoofingAlertsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAntiSpoofingAlertDto) {
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

    const alert = await this.prisma.antiSpoofingAlert.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        cameraDeviceId: createDto.cameraDeviceId,
        alertTime: createDto.alertTime ? new Date(createDto.alertTime) : new Date(),
        alertType: createDto.alertType as any,
        severity: createDto.severity as any,
        status: (createDto.status as any) || 'ACTIVE',
        confidence: createDto.confidence,
        imageUrl: createDto.imageUrl,
        location: createDto.location || cameraDevice.location,
        description: createDto.description,
        remarks: createDto.remarks,
      },
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
    })

    return await this.formatResponse(alert)
  }

  async findAll(
    cameraDeviceId?: string,
    employeeMasterId?: string,
    alertType?: string,
    severity?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {}

    if (cameraDeviceId) where.cameraDeviceId = cameraDeviceId
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (alertType) {
      const typeMap: Record<string, string> = {
        'Photo Detection': 'PHOTO_DETECTION',
        'Video Replay': 'VIDEO_REPLAY',
        'Mask Detection': 'MASK_DETECTION',
        '3D Model': 'MODEL_3D',
        'Liveness Failure': 'LIVENESS_FAILURE',
      }
      where.alertType = typeMap[alertType] || alertType
    }
    if (severity) {
      const severityMap: Record<string, string> = {
        'High': 'HIGH',
        'Medium': 'MEDIUM',
        'Low': 'LOW',
      }
      where.severity = severityMap[severity] || severity
    }
    if (status) {
      const statusMap: Record<string, string> = {
        'Active': 'ACTIVE',
        'Resolved': 'RESOLVED',
        'False Positive': 'FALSE_POSITIVE',
        'active': 'ACTIVE',
      }
      where.status = statusMap[status] || status
    }

    if (startDate || endDate) {
      where.alertTime = {}
      if (startDate) where.alertTime.gte = new Date(startDate)
      if (endDate) where.alertTime.lte = new Date(endDate)
    }

    const alerts = await this.prisma.antiSpoofingAlert.findMany({
      where,
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
      orderBy: { alertTime: 'desc' },
    })

    return Promise.all(alerts.map(alert => this.formatResponse(alert)))
  }

  async findOne(id: string) {
    const alert = await this.prisma.antiSpoofingAlert.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
    })

    if (!alert) {
      throw new NotFoundException('Anti-spoofing alert not found')
    }

    return await this.formatResponse(alert)
  }

  async update(id: string, updateDto: UpdateAntiSpoofingAlertDto) {
    const alert = await this.prisma.antiSpoofingAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('Anti-spoofing alert not found')
    }

    const updateData: any = {}
    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status
      if (updateDto.status === AntiSpoofingAlertStatus.RESOLVED && !alert.resolvedAt) {
        updateData.resolvedAt = new Date()
      }
    }
    if (updateDto.remarks !== undefined) updateData.remarks = updateDto.remarks
    if (updateDto.resolvedBy !== undefined) updateData.resolvedBy = updateDto.resolvedBy

    const updated = await this.prisma.antiSpoofingAlert.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
    })

    return await this.formatResponse(updated)
  }

  async resolve(id: string, resolvedBy?: string, remarks?: string) {
    return this.update(id, {
      status: AntiSpoofingAlertStatus.RESOLVED,
      resolvedBy,
      remarks,
    })
  }

  async markFalsePositive(id: string, remarks?: string) {
    return this.update(id, {
      status: AntiSpoofingAlertStatus.FALSE_POSITIVE,
      remarks,
    })
  }

  async remove(id: string) {
    const alert = await this.prisma.antiSpoofingAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('Anti-spoofing alert not found')
    }

    await this.prisma.antiSpoofingAlert.delete({
      where: { id },
    })

    return { message: 'Anti-spoofing alert deleted successfully' }
  }

  async getStatistics(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate || endDate) {
      where.alertTime = {}
      if (startDate) where.alertTime.gte = new Date(startDate)
      if (endDate) where.alertTime.lte = new Date(endDate)
    }

    const [total, active, high, resolved] = await Promise.all([
      this.prisma.antiSpoofingAlert.count({ where }),
      this.prisma.antiSpoofingAlert.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.antiSpoofingAlert.count({ where: { ...where, severity: 'HIGH' } }),
      this.prisma.antiSpoofingAlert.count({ where: { ...where, status: 'RESOLVED' } }),
    ])

    return { total, active, high, resolved }
  }

  private async formatResponse(alert: any) {
    const typeMap: Record<string, string> = {
      'PHOTO_DETECTION': 'Photo Detection',
      'VIDEO_REPLAY': 'Video Replay',
      'MASK_DETECTION': 'Mask Detection',
      'MODEL_3D': '3D Model',
      'LIVENESS_FAILURE': 'Liveness Failure',
    }

    const severityMap: Record<string, string> = {
      'HIGH': 'High',
      'MEDIUM': 'Medium',
      'LOW': 'Low',
    }

    const statusMap: Record<string, string> = {
      'ACTIVE': 'Active',
      'RESOLVED': 'Resolved',
      'FALSE_POSITIVE': 'False Positive',
    }

    let departmentName = 'Not assigned'
    let designationName = 'Not assigned'

    if (alert.employeeMaster) {
      if (alert.employeeMaster.departmentId) {
        const department = await this.prisma.department.findUnique({
          where: { id: alert.employeeMaster.departmentId },
        })
        departmentName = department?.departmentName || 'Not assigned'
      }

      if (alert.employeeMaster.designationId) {
        const designation = await this.prisma.designation.findUnique({
          where: { id: alert.employeeMaster.designationId },
        })
        designationName = designation?.designationName || 'Not assigned'
      }
    }

    return {
      id: alert.id,
      employeeId: alert.employeeMasterId || undefined,
      employeeCode: alert.employeeMaster?.employeeCode || undefined,
      employeeName: alert.employeeMaster
        ? `${alert.employeeMaster.firstName} ${alert.employeeMaster.lastName}`
        : undefined,
      department: departmentName,
      designation: designationName,
      cameraLocation: alert.location || alert.cameraDevice?.location || 'Unknown',
      alertTime: alert.alertTime.toISOString(),
      alertType: typeMap[alert.alertType] || alert.alertType,
      severity: severityMap[alert.severity] || alert.severity,
      status: statusMap[alert.status] || alert.status,
      confidence: alert.confidence,
      imageUrl: alert.imageUrl,
      description: alert.description,
      remarks: alert.remarks,
      resolvedAt: alert.resolvedAt?.toISOString(),
      resolvedBy: alert.resolvedBy,
      createdAt: alert.createdAt.toISOString(),
    }
  }
}

