import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSMSAlertDto } from './dto/create-sms-alert.dto'
import { UpdateSMSAlertDto } from './dto/update-sms-alert.dto'

@Injectable()
export class SMSAlertsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSMSAlertDto, createdBy: string) {
    const alert = await this.prisma.sMSAlert.create({
      data: {
        message: createDto.message,
        targetAudience: createDto.targetAudience,
        targetDetails: createDto.targetDetails,
        scheduledDate: createDto.scheduledDate ? new Date(createDto.scheduledDate) : null,
        status: createDto.scheduledDate ? 'SCHEDULED' : 'DRAFT',
        createdBy,
      },
    })

    return this.formatResponse(alert)
  }

  async findAll(status?: string, search?: string) {
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { targetAudience: { contains: search, mode: 'insensitive' } },
      ]
    }

    const alerts = await this.prisma.sMSAlert.findMany({
      where,
      orderBy: {
        createdDate: 'desc',
      },
    })

    return alerts.map((alert) => this.formatResponse(alert))
  }

  async findOne(id: string) {
    const alert = await this.prisma.sMSAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('SMS alert not found')
    }

    return this.formatResponse(alert)
  }

  async update(id: string, updateDto: UpdateSMSAlertDto) {
    const alert = await this.prisma.sMSAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('SMS alert not found')
    }

    const updated = await this.prisma.sMSAlert.update({
      where: { id },
      data: {
        ...(updateDto.message && { message: updateDto.message }),
        ...(updateDto.targetAudience && { targetAudience: updateDto.targetAudience }),
        ...(updateDto.targetDetails !== undefined && { targetDetails: updateDto.targetDetails }),
        ...(updateDto.scheduledDate && {
          scheduledDate: new Date(updateDto.scheduledDate),
          status: 'SCHEDULED',
        }),
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const alert = await this.prisma.sMSAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('SMS alert not found')
    }

    await this.prisma.sMSAlert.delete({
      where: { id },
    })
  }

  private formatResponse(alert: any) {
    return {
      id: alert.id,
      message: alert.message,
      targetAudience: alert.targetAudience,
      targetDetails: alert.targetDetails,
      scheduledDate: alert.scheduledDate?.toISOString(),
      sentDate: alert.sentDate?.toISOString(),
      status: alert.status,
      sentCount: alert.sentCount,
      deliveredCount: alert.deliveredCount,
      createdBy: alert.createdBy,
      createdDate: alert.createdDate.toISOString().split('T')[0],
    }
  }
}

