import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmailAlertDto } from './dto/create-email-alert.dto'
import { UpdateEmailAlertDto } from './dto/update-email-alert.dto'

@Injectable()
export class EmailAlertsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateEmailAlertDto, createdBy: string) {
    const alert = await this.prisma.emailAlert.create({
      data: {
        subject: createDto.subject,
        emailBody: createDto.emailBody,
        targetAudience: createDto.targetAudience,
        targetDetails: createDto.targetDetails,
        templateId: createDto.templateId,
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
        { subject: { contains: search, mode: 'insensitive' } },
        { emailBody: { contains: search, mode: 'insensitive' } },
        { targetAudience: { contains: search, mode: 'insensitive' } },
      ]
    }

    const alerts = await this.prisma.emailAlert.findMany({
      where,
      orderBy: {
        createdDate: 'desc',
      },
    })

    return alerts.map((alert) => this.formatResponse(alert))
  }

  async findOne(id: string) {
    const alert = await this.prisma.emailAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('Email alert not found')
    }

    return this.formatResponse(alert)
  }

  async update(id: string, updateDto: UpdateEmailAlertDto) {
    const alert = await this.prisma.emailAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('Email alert not found')
    }

    const updated = await this.prisma.emailAlert.update({
      where: { id },
      data: {
        ...(updateDto.subject && { subject: updateDto.subject }),
        ...(updateDto.emailBody && { emailBody: updateDto.emailBody }),
        ...(updateDto.targetAudience && { targetAudience: updateDto.targetAudience }),
        ...(updateDto.targetDetails !== undefined && { targetDetails: updateDto.targetDetails }),
        ...(updateDto.templateId !== undefined && { templateId: updateDto.templateId }),
        ...(updateDto.scheduledDate && {
          scheduledDate: new Date(updateDto.scheduledDate),
          status: 'SCHEDULED',
        }),
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const alert = await this.prisma.emailAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      throw new NotFoundException('Email alert not found')
    }

    await this.prisma.emailAlert.delete({
      where: { id },
    })
  }

  private formatResponse(alert: any) {
    return {
      id: alert.id,
      subject: alert.subject,
      emailBody: alert.emailBody,
      targetAudience: alert.targetAudience,
      targetDetails: alert.targetDetails,
      templateId: alert.templateId,
      scheduledDate: alert.scheduledDate?.toISOString(),
      sentDate: alert.sentDate?.toISOString(),
      status: alert.status,
      sentCount: alert.sentCount,
      deliveredCount: alert.deliveredCount,
      openedCount: alert.openedCount,
      createdBy: alert.createdBy,
      createdDate: alert.createdDate.toISOString().split('T')[0],
    }
  }
}

