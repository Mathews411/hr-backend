import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLocationDeviationAlertDto } from './dto/create-location-deviation-alert.dto'
import { UpdateLocationDeviationAlertDto } from './dto/update-location-deviation-alert.dto'
import { LocationAlertStatus } from './dto/create-location-deviation-alert.dto'

@Injectable()
export class LocationDeviationAlertsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLocationDeviationAlertDto) {
    return this.prisma.locationDeviationAlert.create({
      data: {
        ...createDto,
        alertTime: createDto.alertTime ? new Date(createDto.alertTime) : new Date(),
        status: createDto.status || 'ACTIVE',
      },
      include: {
        employeeMaster: true,
        project: true,
        geofenceArea: true,
      },
    })
  }

  async findAll(
    alertType?: string,
    severity?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {}

    if (alertType && alertType !== 'all') {
      where.alertType = alertType
    }

    if (severity && severity !== 'all') {
      where.severity = severity
    }

    if (status === 'active') {
      where.status = 'ACTIVE'
    } else if (status && status !== 'all') {
      where.status = status
    }

    if (startDate || endDate) {
      where.alertTime = {}
      if (startDate) where.alertTime.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.alertTime.lte = end
      }
    }

    const alerts = await this.prisma.locationDeviationAlert.findMany({
      where,
      include: {
        employeeMaster: true,
        project: true,
        geofenceArea: true,
      },
      orderBy: { alertTime: 'desc' },
    })

    // Fetch department and designation data for each employee
    const alertsWithDetails = await Promise.all(
      alerts.map(async (alert) => {
        let departmentName = 'Not assigned'
        let designationName = 'Not assigned'

        if (alert.employeeMaster?.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: alert.employeeMaster.departmentId },
          })
          departmentName = department?.departmentName || 'Not assigned'
        }

        if (alert.employeeMaster?.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: alert.employeeMaster.designationId },
          })
          designationName = designation?.designationName || 'Not assigned'
        }

        return {
          id: alert.id,
          employeeId: alert.employeeMasterId,
          employeeCode: alert.employeeMaster?.employeeCode || '',
          employeeName: alert.employeeMaster
            ? `${alert.employeeMaster.firstName} ${alert.employeeMaster.lastName}`
            : 'Unknown',
          department: departmentName,
          designation: designationName,
          projectId: alert.projectId,
          projectName: alert.project?.name,
          projectCode: alert.project?.code,
          geofenceName: alert.geofenceArea?.geofenceName,
          alertTime: alert.alertTime.toISOString(),
          alertType: alert.alertType,
          severity: alert.severity,
          status: alert.status,
          currentLatitude: alert.currentLatitude,
          currentLongitude: alert.currentLongitude,
          expectedLatitude: alert.expectedLatitude,
          expectedLongitude: alert.expectedLongitude,
          deviationDistance: alert.deviationDistance,
          description: alert.description,
          remarks: alert.remarks,
        }
      })
    )

    return alertsWithDetails
  }

  async findOne(id: string) {
    const alert = await this.prisma.locationDeviationAlert.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        project: true,
        geofenceArea: true,
      },
    })

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`)
    }

    let departmentName = 'Not assigned'
    let designationName = 'Not assigned'

    if (alert.employeeMaster?.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: alert.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || 'Not assigned'
    }

    if (alert.employeeMaster?.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: alert.employeeMaster.designationId },
      })
      designationName = designation?.designationName || 'Not assigned'
    }

    return {
      id: alert.id,
      employeeId: alert.employeeMasterId,
      employeeCode: alert.employeeMaster?.employeeCode || '',
      employeeName: alert.employeeMaster
        ? `${alert.employeeMaster.firstName} ${alert.employeeMaster.lastName}`
        : 'Unknown',
      department: departmentName,
      designation: designationName,
      projectId: alert.projectId,
      projectName: alert.project?.name,
      projectCode: alert.project?.code,
      geofenceName: alert.geofenceArea?.geofenceName,
      alertTime: alert.alertTime.toISOString(),
      alertType: alert.alertType,
      severity: alert.severity,
      status: alert.status,
      currentLatitude: alert.currentLatitude,
      currentLongitude: alert.currentLongitude,
      expectedLatitude: alert.expectedLatitude,
      expectedLongitude: alert.expectedLongitude,
      deviationDistance: alert.deviationDistance,
      description: alert.description,
      remarks: alert.remarks,
    }
  }

  async update(id: string, updateDto: UpdateLocationDeviationAlertDto) {
    await this.findOne(id)

    const updateData: any = { ...updateDto }
    if (updateDto.status === LocationAlertStatus.RESOLVED) {
      updateData.resolvedAt = new Date()
    }

    return this.prisma.locationDeviationAlert.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        project: true,
        geofenceArea: true,
      },
    })
  }

  async resolve(id: string, resolvedBy?: string, remarks?: string) {
    return this.update(id, {
      status: LocationAlertStatus.RESOLVED,
      resolvedBy,
      remarks,
    })
  }
}

