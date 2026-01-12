import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePushNotificationDto } from './dto/create-push-notification.dto'
import { UpdatePushNotificationDto } from './dto/update-push-notification.dto'

@Injectable()
export class PushNotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePushNotificationDto, createdBy: string) {
    const notification = await this.prisma.pushNotification.create({
      data: {
        title: createDto.title,
        message: createDto.message,
        targetAudience: createDto.targetAudience,
        targetDetails: createDto.targetDetails,
        priority: createDto.priority,
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
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { targetAudience: { contains: search, mode: 'insensitive' } },
      ]
    }

    const notifications = await this.prisma.pushNotification.findMany({
      where,
      orderBy: {
        createdDate: 'desc',
      },
    })

    return notifications.map((notification) => this.formatResponse(notification))
  }

  async findOne(id: string) {
    const notification = await this.prisma.pushNotification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new NotFoundException('Push notification not found')
    }

    return this.formatResponse(notification)
  }

  async update(id: string, updateDto: UpdatePushNotificationDto) {
    const notification = await this.prisma.pushNotification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new NotFoundException('Push notification not found')
    }

    const updated = await this.prisma.pushNotification.update({
      where: { id },
      data: {
        ...(updateDto.title && { title: updateDto.title }),
        ...(updateDto.message && { message: updateDto.message }),
        ...(updateDto.targetAudience && { targetAudience: updateDto.targetAudience }),
        ...(updateDto.targetDetails !== undefined && { targetDetails: updateDto.targetDetails }),
        ...(updateDto.priority && { priority: updateDto.priority }),
        ...(updateDto.scheduledDate && {
          scheduledDate: new Date(updateDto.scheduledDate),
          status: 'SCHEDULED',
        }),
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const notification = await this.prisma.pushNotification.findUnique({
      where: { id },
    })

    if (!notification) {
      throw new NotFoundException('Push notification not found')
    }

    await this.prisma.pushNotification.delete({
      where: { id },
    })
  }

  private formatResponse(notification: any) {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      targetAudience: notification.targetAudience,
      targetDetails: notification.targetDetails,
      priority: notification.priority,
      scheduledDate: notification.scheduledDate?.toISOString(),
      sentDate: notification.sentDate?.toISOString(),
      status: notification.status,
      sentCount: notification.sentCount,
      readCount: notification.readCount,
      createdBy: notification.createdBy,
      createdDate: notification.createdDate.toISOString().split('T')[0],
    }
  }
}

