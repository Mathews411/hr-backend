import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFaceEnrollmentDto } from './dto/create-face-enrollment.dto'
import { UpdateFaceEnrollmentDto } from './dto/update-face-enrollment.dto'
import { UploadFaceImageDto } from './dto/upload-face-image.dto'
import { FaceEnrollmentStatus } from './dto/create-face-enrollment.dto'

@Injectable()
export class FaceEnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateFaceEnrollmentDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })
    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    // Check if enrollment already exists
    const existing = await this.prisma.faceEnrollment.findFirst({
      where: { employeeMasterId: createDto.employeeMasterId },
      include: {
        faceImagesData: true,
      },
    })

    if (existing) {
      return await this.formatResponse(existing, employee)
    }

    const enrollment = await this.prisma.faceEnrollment.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        status: (createDto.status as any) || 'PENDING',
      },
      include: {
        faceImagesData: true,
      },
    })

    return await this.formatResponse(enrollment, employee)
  }

  async findAll(employeeMasterId?: string, status?: string, search?: string) {
    const where: any = {}
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (status) {
      // Map frontend status to backend enum
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

    const enrollments = await this.prisma.faceEnrollment.findMany({
      where,
      include: {
        employeeMaster: true,
        faceImagesData: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return Promise.all(
      enrollments.map(async (enrollment) => {
        const employee = await this.prisma.employeeMaster.findUnique({
          where: { id: enrollment.employeeMasterId },
        })
        return await this.formatResponse(enrollment, employee!)
      })
    )
  }

  async findOne(id: string) {
    const enrollment = await this.prisma.faceEnrollment.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        faceImagesData: true,
      },
    })

    if (!enrollment) {
      throw new NotFoundException('Face enrollment not found')
    }

    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: enrollment.employeeMasterId },
    })

    return await this.formatResponse(enrollment, employee!)
  }

  async findByEmployeeId(employeeMasterId: string) {
    const enrollment = await this.prisma.faceEnrollment.findFirst({
      where: { employeeMasterId },
      include: {
        faceImagesData: true,
      },
    })

    if (!enrollment) {
      return null
    }

    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: employeeMasterId },
    })

    if (!employee) {
      return null
    }

    return this.formatResponse(enrollment, employee)
  }

  async update(id: string, updateDto: UpdateFaceEnrollmentDto) {
    const enrollment = await this.prisma.faceEnrollment.findUnique({
      where: { id },
      include: { employeeMaster: true },
    })

    if (!enrollment) {
      throw new NotFoundException('Face enrollment not found')
    }

    const updateData: any = {}
    if (updateDto.status) updateData.status = updateDto.status
    if (updateDto.qualityScore !== undefined) updateData.qualityScore = updateDto.qualityScore

    if (updateDto.status === 'COMPLETED' && !enrollment.completedDate) {
      updateData.completedDate = new Date()
    }

    const updated = await this.prisma.faceEnrollment.update({
      where: { id },
      data: updateData,
      include: {
        faceImagesData: true,
      },
    })

    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: updated.employeeMasterId },
    })

    return this.formatResponse(updated, employee!)
  }

  async uploadFaceImage(uploadDto: UploadFaceImageDto) {
    const enrollment = await this.prisma.faceEnrollment.findUnique({
      where: { id: uploadDto.faceEnrollmentId },
    })

    if (!enrollment) {
      throw new NotFoundException('Face enrollment not found')
    }

    const faceImage = await this.prisma.faceImage.create({
      data: {
        faceEnrollmentId: uploadDto.faceEnrollmentId,
        imageUrl: uploadDto.imageUrl,
        imageName: uploadDto.imageName,
        imageSize: uploadDto.imageSize,
        qualityScore: uploadDto.qualityScore,
      },
    })

    // Update enrollment face images count
    const imageCount = await this.prisma.faceImage.count({
      where: { faceEnrollmentId: uploadDto.faceEnrollmentId },
    })

    // Calculate average quality score
    const images = await this.prisma.faceImage.findMany({
      where: { faceEnrollmentId: uploadDto.faceEnrollmentId },
      select: { qualityScore: true },
    })

    const avgQualityScore = images
      .filter(img => img.qualityScore !== null)
      .reduce((sum, img) => sum + (img.qualityScore || 0), 0) / images.filter(img => img.qualityScore !== null).length

    const updateData: any = {
      faceImages: imageCount,
      status: imageCount >= 5 ? 'COMPLETED' : 'IN_PROGRESS',
    }

    if (avgQualityScore > 0) {
      updateData.qualityScore = avgQualityScore
    }

    if (imageCount >= 5 && !enrollment.completedDate) {
      updateData.completedDate = new Date()
    }

    await this.prisma.faceEnrollment.update({
      where: { id: uploadDto.faceEnrollmentId },
      data: updateData,
    })

    return faceImage
  }

  async remove(id: string) {
    const enrollment = await this.prisma.faceEnrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      throw new NotFoundException('Face enrollment not found')
    }

    await this.prisma.faceEnrollment.delete({
      where: { id },
    })

    return { message: 'Face enrollment deleted successfully' }
  }

  private async formatResponse(enrollment: any, employee: any) {
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
      enrollmentDate: enrollment.enrollmentDate.toISOString().split('T')[0],
      status: this.mapStatus(enrollment.status),
      faceImages: enrollment.faceImages || (enrollment.faceImagesData ? enrollment.faceImagesData.length : 0),
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

