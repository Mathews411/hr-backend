import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFingerprintValidationAlertDto } from './dto/create-fingerprint-validation-alert.dto'
import { UpdateFingerprintValidationAlertDto } from './dto/update-fingerprint-validation-alert.dto'
import { FingerprintValidationAlertStatus } from './dto/create-fingerprint-validation-alert.dto'

@Injectable()
export class FingerprintValidationAlertsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateFingerprintValidationAlertDto) {
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

    const alert = await this.prisma.fingerprintValidationAlert.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        fingerprintDeviceId: createDto.fingerprintDeviceId,
        alertTime: createDto.alertTime ? new Date(createDto.alertTime) : new Date(),
        alertType: createDto.alertType as any,
        severity: createDto.severity as any,
        status: (createDto.status as any) || 'ACTIVE',
        confidence: createDto.confidence,
        location: createDto.location || device.location,
        description: createDto.description,
        remarks: createDto.remarks,
      },
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    return await this.formatResponse(alert)
  }

  async findAll(
    fingerprintDeviceId?: string,
    employeeMasterId?: string,
    alertType?: string,
    severity?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {}

    if (fingerprintDeviceId) where.fingerprintDeviceId = fingerprintDeviceId
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (alertType) {
      const typeMap: Record<string, string> = {
        'Low Quality': 'LOW_QUALITY',
        'Template Mismatch': 'TEMPLATE_MISMATCH',
        'Duplicate Enrollment': 'DUPLICATE_ENROLLMENT',
        'Device Error': 'DEVICE_ERROR',
        'Communication Failure': 'COMMUNICATION_FAILURE',
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

    const alerts = await this.prisma.fingerprintValidationAlert.findMany({
      where,
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
      orderBy: { alertTime: 'desc' },
    })

    return Promise.all(alerts.map(alert => this.formatResponse(alert)))
  }

  async findOne(id: string) {
    const alert = await this.prisma.fingerprintValidationAlert.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    if (!alert) {
      throw new NotFoundException('Fingerprint validation alert not found')
    }

    return await this.formatResponse(alert)
  }

  async update(id: string, updateDto: UpdateFingerprintValidationAlertDto) {
    const alert = await this.prisma.fingerprintValidationAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('Fingerprint validation alert not found')
    }

    const updateData: any = {}
    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status
      if (updateDto.status === FingerprintValidationAlertStatus.RESOLVED && !alert.resolvedAt) {
        updateData.resolvedAt = new Date()
      }
    }
    if (updateDto.remarks !== undefined) updateData.remarks = updateDto.remarks

    const updated = await this.prisma.fingerprintValidationAlert.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    return await this.formatResponse(updated)
  }

  async resolve(id: string, resolvedBy?: string, remarks?: string) {
    return this.update(id, {
      status: FingerprintValidationAlertStatus.RESOLVED,
      remarks,
    })
  }

  async markFalsePositive(id: string, remarks?: string) {
    return this.update(id, {
      status: FingerprintValidationAlertStatus.FALSE_POSITIVE,
      remarks,
    })
  }

  async remove(id: string) {
    const alert = await this.prisma.fingerprintValidationAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('Fingerprint validation alert not found')
    }

    await this.prisma.fingerprintValidationAlert.delete({
      where: { id },
    })

    return { message: 'Fingerprint validation alert deleted successfully' }
  }

  async getStatistics(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate || endDate) {
      where.alertTime = {}
      if (startDate) where.alertTime.gte = new Date(startDate)
      if (endDate) where.alertTime.lte = new Date(endDate)
    }

    const [total, active, high, resolved] = await Promise.all([
      this.prisma.fingerprintValidationAlert.count({ where }),
      this.prisma.fingerprintValidationAlert.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.fingerprintValidationAlert.count({ where: { ...where, severity: 'HIGH' } }),
      this.prisma.fingerprintValidationAlert.count({ where: { ...where, status: 'RESOLVED' } }),
    ])

    return {
      total,
      active,
      high,
      resolved,
    }
  }

  private async formatResponse(alert: any) {
    let employeeName: string | undefined
    let employeeCode: string | undefined
    let department: string | undefined

    if (alert.employeeMaster) {
      employeeName = `${alert.employeeMaster.firstName} ${alert.employeeMaster.lastName}`
      employeeCode = alert.employeeMaster.employeeCode

      if (alert.employeeMaster.departmentId) {
        const dept = await this.prisma.department.findUnique({
          where: { id: alert.employeeMaster.departmentId },
        })
        department = dept?.departmentName || undefined
      }
    }

    const typeMap: Record<string, string> = {
      'LOW_QUALITY': 'Low Quality',
      'TEMPLATE_MISMATCH': 'Template Mismatch',
      'DUPLICATE_ENROLLMENT': 'Duplicate Enrollment',
      'DEVICE_ERROR': 'Device Error',
      'COMMUNICATION_FAILURE': 'Communication Failure',
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

    return {
      id: alert.id,
      employeeId: alert.employeeMasterId || undefined,
      employeeCode,
      employeeName,
      department,
      alertTime: alert.alertTime.toISOString(),
      alertType: typeMap[alert.alertType] || alert.alertType,
      severity: severityMap[alert.severity] || alert.severity,
      status: statusMap[alert.status] || alert.status,
      confidence: alert.confidence,
      deviceLocation: alert.location || alert.fingerprintDevice?.location || '',
      description: alert.description,
      remarks: alert.remarks,
      resolvedAt: alert.resolvedAt?.toISOString(),
      resolvedBy: alert.resolvedBy,
      createdAt: alert.createdAt.toISOString(),
    }
  }
}

