import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ZKFingerSDKWrapperService } from '../fingerprint-devices/zkfinger-sdk-wrapper.service'
import { CreateFingerprintEnrollmentDto } from './dto/create-fingerprint-enrollment.dto'
import { UpdateFingerprintEnrollmentDto } from './dto/update-fingerprint-enrollment.dto'
import { EnrollFingerprintDto } from './dto/enroll-fingerprint.dto'

@Injectable()
export class FingerprintEnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private sdkWrapper: ZKFingerSDKWrapperService,
  ) {}

  async create(createDto: CreateFingerprintEnrollmentDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })
    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { id: createDto.fingerprintDeviceId },
    })
    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    // Check if enrollment already exists for this employee and device
    const existing = await this.prisma.fingerprintEnrollment.findFirst({
      where: {
        employeeMasterId: createDto.employeeMasterId,
        fingerprintDeviceId: createDto.fingerprintDeviceId,
        fingerprintIndex: createDto.fingerprintIndex || null,
      },
    })

    if (existing) {
      return await this.formatResponse(existing, employee, device)
    }

    const enrollment = await this.prisma.fingerprintEnrollment.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        fingerprintDeviceId: createDto.fingerprintDeviceId,
        fingerprintIndex: createDto.fingerprintIndex || null,
        status: (createDto.status as any) || 'PENDING',
      },
    })

    return await this.formatResponse(enrollment, employee, device)
  }

  async findAll(employeeMasterId?: string, deviceId?: string, status?: string, search?: string) {
    const where: any = {}
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (deviceId) where.fingerprintDeviceId = deviceId
    if (status) {
      const statusMap: Record<string, string> = {
        'Pending': 'PENDING',
        'In Progress': 'IN_PROGRESS',
        'Completed': 'COMPLETED',
        'Failed': 'FAILED',
      }
      where.status = statusMap[status] || status
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const enrollments = await this.prisma.fingerprintEnrollment.findMany({
      where,
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return Promise.all(
      enrollments.map(async (enrollment) => {
        const employee = await this.prisma.employeeMaster.findUnique({
          where: { id: enrollment.employeeMasterId },
        })
        const device = await this.prisma.fingerprintDevice.findUnique({
          where: { id: enrollment.fingerprintDeviceId },
        })
        return await this.formatResponse(enrollment, employee!, device!)
      })
    )
  }

  async findOne(id: string) {
    const enrollment = await this.prisma.fingerprintEnrollment.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    if (!enrollment) {
      throw new NotFoundException('Fingerprint enrollment not found')
    }

    return await this.formatResponse(enrollment, enrollment.employeeMaster, enrollment.fingerprintDevice)
  }

  async findByEmployeeId(employeeMasterId: string, deviceId?: string) {
    const where: any = { employeeMasterId }
    if (deviceId) where.fingerprintDeviceId = deviceId

    const enrollments = await this.prisma.fingerprintEnrollment.findMany({
      where,
      include: {
        fingerprintDevice: true,
      },
    })

    if (enrollments.length === 0) {
      return []
    }

    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: employeeMasterId },
    })

    if (!employee) {
      return []
    }

    return Promise.all(
      enrollments.map(async (enrollment) => {
        return await this.formatResponse(enrollment, employee, enrollment.fingerprintDevice)
      })
    )
  }

  async update(id: string, updateDto: UpdateFingerprintEnrollmentDto) {
    const enrollment = await this.prisma.fingerprintEnrollment.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    if (!enrollment) {
      throw new NotFoundException('Fingerprint enrollment not found')
    }

    const updateData: any = {}
    if (updateDto.status) updateData.status = updateDto.status
    if (updateDto.qualityScore !== undefined) updateData.qualityScore = updateDto.qualityScore
    if (updateDto.fingerprintTemplate !== undefined) updateData.fingerprintTemplate = updateDto.fingerprintTemplate

    if (updateDto.status === 'COMPLETED' && !enrollment.completedDate) {
      updateData.completedDate = new Date()
    }

    const updated = await this.prisma.fingerprintEnrollment.update({
      where: { id },
      data: updateData,
    })

    return await this.formatResponse(updated, enrollment.employeeMaster, enrollment.fingerprintDevice)
  }

  async enrollFingerprint(enrollDto: EnrollFingerprintDto) {
    const enrollment = await this.prisma.fingerprintEnrollment.findUnique({
      where: { id: enrollDto.enrollmentId },
      include: {
        employeeMaster: true,
        fingerprintDevice: true,
      },
    })

    if (!enrollment) {
      throw new NotFoundException('Fingerprint enrollment not found')
    }

    if (enrollment.status === 'COMPLETED') {
      throw new BadRequestException('Enrollment already completed')
    }

    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { id: enrollment.fingerprintDeviceId },
    })

    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    if (!device.isEnabled || device.status !== 'ACTIVE') {
      throw new BadRequestException('Device is not active. Please enable the device first.')
    }

    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: enrollment.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    // Connect to device and enroll fingerprint
    try {
      // Connect to device
      const handle = await this.sdkWrapper.connect(device)
      
      // Add user to device (if not already added)
      // Use employee code as user ID on device
      const userId = parseInt(employee.employeeCode) || 0
      if (userId > 0) {
        await this.sdkWrapper.addUser(device.id, userId, `${employee.firstName} ${employee.lastName}`, 0)
      }

      // Enroll fingerprint on device
      const fingerIndex = enrollDto.fingerprintIndex || enrollment.fingerprintIndex || 1
      const fingerprintTemplate = await this.sdkWrapper.enrollFingerprint(
        device.id,
        userId,
        fingerIndex
      )

      // Update enrollment with template and mark as completed
      const updateData: any = {
        status: 'COMPLETED',
        fingerprintTemplate: fingerprintTemplate,
        fingerprintIndex: fingerIndex,
        completedDate: new Date(),
        qualityScore: 85, // Default quality score, should be calculated from device
      }

      const updated = await this.prisma.fingerprintEnrollment.update({
        where: { id: enrollDto.enrollmentId },
        data: updateData,
      })

      return await this.formatResponse(updated, enrollment.employeeMaster, enrollment.fingerprintDevice)
    } catch (error) {
      // Update enrollment status to FAILED on error
      await this.prisma.fingerprintEnrollment.update({
        where: { id: enrollDto.enrollmentId },
        data: { status: 'FAILED' },
      })
      throw new BadRequestException(`Failed to enroll fingerprint: ${error.message}`)
    }
  }

  async remove(id: string) {
    const enrollment = await this.prisma.fingerprintEnrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      throw new NotFoundException('Fingerprint enrollment not found')
    }

    await this.prisma.fingerprintEnrollment.delete({
      where: { id },
    })

    return { message: 'Fingerprint enrollment deleted successfully' }
  }

  private async formatResponse(enrollment: any, employee: any, device: any) {
    let departmentName = 'Not assigned'
    let designationName = 'Not assigned'

    if (employee.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: employee.departmentId },
      })
      departmentName = department?.departmentName || 'Not assigned'
    }

    if (employee.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: employee.designationId },
      })
      designationName = designation?.designationName || 'Not assigned'
    }

    return {
      id: enrollment.id,
      employeeId: enrollment.employeeMasterId,
      employeeCode: employee.employeeCode,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: departmentName,
      designation: designationName,
      deviceId: device.id,
      deviceName: device.deviceName,
      deviceSerialNumber: device.serialNumber,
      enrollmentDate: enrollment.enrollmentDate.toISOString().split('T')[0],
      status: this.mapStatus(enrollment.status),
      fingerprintIndex: enrollment.fingerprintIndex || 1,
      qualityScore: enrollment.qualityScore || undefined,
      lastUpdated: enrollment.updatedAt.toISOString(),
      completedDate: enrollment.completedDate?.toISOString(),
      createdAt: enrollment.createdAt.toISOString(),
    }
  }

  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      FAILED: 'Failed',
    }
    return statusMap[status] || status
  }
}

