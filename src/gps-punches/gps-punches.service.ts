import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGPSPunchDto } from './dto/create-gps-punch.dto'

@Injectable()
export class GPSPunchesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateGPSPunchDto) {
    return this.prisma.gPSPunch.create({
      data: {
        ...createDto,
        punchTime: createDto.punchTime ? new Date(createDto.punchTime) : new Date(),
      },
      include: {
        employeeMaster: true,
        project: true,
        geofenceArea: true,
      },
    })
  }

  async findAll(
    employeeMasterId?: string,
    punchType?: string,
    status?: string,
    projectId?: string,
    startDate?: string,
    endDate?: string,
    search?: string,
  ) {
    const where: any = {}

    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (punchType && punchType !== 'all') where.punchType = punchType
    if (status && status !== 'all') where.status = status
    if (projectId && projectId !== 'all') where.projectId = projectId

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (startDate || endDate) {
      where.punchTime = {}
      if (startDate) where.punchTime.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.punchTime.lte = end
      }
    }

    const punches = await this.prisma.gPSPunch.findMany({
      where,
      include: {
        employeeMaster: true,
        project: true,
        geofenceArea: true,
      },
      orderBy: { punchTime: 'desc' },
    })

    // Fetch department and designation data for each employee
    const punchesWithDetails = await Promise.all(
      punches.map(async (punch) => {
        let departmentName = 'Not assigned'
        let designationName = 'Not assigned'

        if (punch.employeeMaster?.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: punch.employeeMaster.departmentId },
          })
          departmentName = department?.departmentName || 'Not assigned'
        }

        if (punch.employeeMaster?.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: punch.employeeMaster.designationId },
          })
          designationName = designation?.designationName || 'Not assigned'
        }

        return {
          id: punch.id,
          employeeId: punch.employeeMasterId,
          employeeCode: punch.employeeMaster?.employeeCode || '',
          employeeName: punch.employeeMaster
            ? `${punch.employeeMaster.firstName} ${punch.employeeMaster.lastName}`
            : 'Unknown',
          department: departmentName,
          designation: designationName,
          projectId: punch.projectId,
          projectName: punch.project?.name,
          projectCode: punch.project?.code,
          geofenceName: punch.geofenceArea?.geofenceName,
          punchType: punch.punchType,
          punchTime: punch.punchTime.toISOString(),
          latitude: punch.latitude,
          longitude: punch.longitude,
          location: punch.location,
          distance: punch.distance,
          status: punch.status,
          accuracy: punch.accuracy,
        }
      })
    )

    return punchesWithDetails
  }
}

