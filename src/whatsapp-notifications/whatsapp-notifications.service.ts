import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateWhatsAppNotificationDto } from './dto/create-whatsapp-notification.dto'
import { UpdateWhatsAppNotificationDto } from './dto/update-whatsapp-notification.dto'

@Injectable()
export class WhatsAppNotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateWhatsAppNotificationDto, createdBy: string) {
    const notification = await this.prisma.whatsAppNotification.create({
      data: {
        message: createDto.message,
        targetAudience: createDto.targetAudience,
        targetDetails: createDto.targetDetails,
        templateId: createDto.templateId,
        scheduledDate: createDto.scheduledDate ? new Date(createDto.scheduledDate) : null,
        status: createDto.scheduledDate ? 'SCHEDULED' : 'DRAFT',
        createdBy,
      },
    })

    return this.formatResponse(notification)
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

    const notifications = await this.prisma.whatsAppNotification.findMany({
      where,
      orderBy: {
        createdDate: 'desc',
      },
    })

    return notifications.map((notification) => this.formatResponse(notification))
  }

  async findOne(id: string) {
    const notification = await this.prisma.whatsAppNotification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new NotFoundException('WhatsApp notification not found')
    }

    return this.formatResponse(notification)
  }

  async update(id: string, updateDto: UpdateWhatsAppNotificationDto) {
    const notification = await this.prisma.whatsAppNotification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new NotFoundException('WhatsApp notification not found')
    }

    const updated = await this.prisma.whatsAppNotification.update({
      where: { id },
      data: {
        ...(updateDto.message && { message: updateDto.message }),
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
    const notification = await this.prisma.whatsAppNotification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new NotFoundException('WhatsApp notification not found')
    }

    await this.prisma.whatsAppNotification.delete({
      where: { id },
    })
  }

  private formatResponse(notification: any) {
    return {
      id: notification.id,
      message: notification.message,
      targetAudience: notification.targetAudience,
      targetDetails: notification.targetDetails,
      templateId: notification.templateId,
      scheduledDate: notification.scheduledDate?.toISOString(),
      sentDate: notification.sentDate?.toISOString(),
      status: notification.status,
      sentCount: notification.sentCount,
      deliveredCount: notification.deliveredCount,
      readCount: notification.readCount,
      createdBy: notification.createdBy,
      createdDate: notification.createdDate.toISOString().split('T')[0],
    }
  }
}

