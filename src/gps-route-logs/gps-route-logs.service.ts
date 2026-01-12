import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class GPSRouteLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    employeeMasterId?: string,
    projectId?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    search?: string,
  ) {
    const where: any = {}

    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (projectId && projectId !== 'all') where.projectId = projectId
    if (status && status !== 'all') where.status = status

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.date.lte = end
      }
    }

    const routes = await this.prisma.gPSRouteLog.findMany({
      where,
      include: {
        employeeMaster: true,
        project: true,
        waypoints: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    })

    // Fetch department and designation data for each employee
    const routesWithDetails = await Promise.all(
      routes.map(async (route) => {
        let departmentName = 'Not assigned'
        let designationName = 'Not assigned'

        if (route.employeeMaster?.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: route.employeeMaster.departmentId },
          })
          departmentName = department?.departmentName || 'Not assigned'
        }

        if (route.employeeMaster?.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: route.employeeMaster.designationId },
          })
          designationName = designation?.designationName || 'Not assigned'
        }

        return {
          id: route.id,
          employeeId: route.employeeMasterId,
          employeeCode: route.employeeMaster?.employeeCode || '',
          employeeName: route.employeeMaster
            ? `${route.employeeMaster.firstName} ${route.employeeMaster.lastName}`
            : 'Unknown',
          department: departmentName,
          designation: designationName,
          projectId: route.projectId,
          projectName: route.project?.name,
          projectCode: route.project?.code,
          date: route.date.toISOString().split('T')[0],
          startTime: route.startTime.toISOString().split('T')[1].split('.')[0],
          endTime: route.endTime?.toISOString().split('T')[1].split('.')[0],
          startLocation: route.startLocation,
          endLocation: route.endLocation,
          startLatitude: route.startLatitude,
          startLongitude: route.startLongitude,
          endLatitude: route.endLatitude,
          endLongitude: route.endLongitude,
          totalDistance: route.totalDistance,
          totalDuration: route.totalDuration,
          waypoints: route.waypoints.length,
          status: route.status,
        }
      })
    )

    return routesWithDetails
  }

  async findOne(id: string) {
    const route = await this.prisma.gPSRouteLog.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        project: true,
        waypoints: {
          orderBy: { timestamp: 'asc' },
        },
      },
    })

    if (!route) {
      return null
    }

    let departmentName = 'Not assigned'
    let designationName = 'Not assigned'

    if (route.employeeMaster?.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: route.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || 'Not assigned'
    }

    if (route.employeeMaster?.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: route.employeeMaster.designationId },
      })
      designationName = designation?.designationName || 'Not assigned'
    }

    return {
      id: route.id,
      employeeId: route.employeeMasterId,
      employeeCode: route.employeeMaster?.employeeCode || '',
      employeeName: route.employeeMaster
        ? `${route.employeeMaster.firstName} ${route.employeeMaster.lastName}`
        : 'Unknown',
      department: departmentName,
      designation: designationName,
      projectId: route.projectId,
      projectName: route.project?.name,
      projectCode: route.project?.code,
      date: route.date.toISOString().split('T')[0],
      startTime: route.startTime.toISOString().split('T')[1].split('.')[0],
      endTime: route.endTime?.toISOString().split('T')[1].split('.')[0],
      startLocation: route.startLocation,
      endLocation: route.endLocation,
      startLatitude: route.startLatitude,
      startLongitude: route.startLongitude,
      endLatitude: route.endLatitude,
      endLongitude: route.endLongitude,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      waypoints: route.waypoints.map(wp => ({
        id: wp.id,
        timestamp: wp.timestamp.toISOString().split('T')[1].split('.')[0],
        latitude: wp.latitude,
        longitude: wp.longitude,
        location: wp.location,
        speed: wp.speed,
      })),
      status: route.status,
    }
  }
}

