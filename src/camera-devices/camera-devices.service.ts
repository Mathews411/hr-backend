import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCameraDeviceDto } from './dto/create-camera-device.dto'
import { UpdateCameraDeviceDto } from './dto/update-camera-device.dto'

@Injectable()
export class CameraDevicesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCameraDeviceDto) {
    // Check if deviceId already exists
    const existing = await this.prisma.cameraDevice.findUnique({
      where: { deviceId: createDto.deviceId },
    })

    if (existing) {
      throw new ConflictException('Device ID already exists')
    }

    const device = await this.prisma.cameraDevice.create({
      data: {
        deviceName: createDto.deviceName,
        deviceId: createDto.deviceId,
        location: createDto.location,
        ipAddress: createDto.ipAddress,
        port: createDto.port,
        status: (createDto.status as any) || 'INACTIVE',
        recognitionAccuracy: createDto.recognitionAccuracy || 0,
        isEnabled: createDto.isEnabled !== undefined ? createDto.isEnabled : true,
        model: createDto.model,
        firmwareVersion: createDto.firmwareVersion,
      },
    })

    return this.formatResponse(device)
  }

  async findAll(status?: string, search?: string) {
    const where: any = {}
    
    if (status && status !== 'all') {
      const statusMap: Record<string, string> = {
        'Active': 'ACTIVE',
        'Inactive': 'INACTIVE',
        'Offline': 'OFFLINE',
      }
      where.status = statusMap[status] || status
    }

    if (search) {
      where.OR = [
        { deviceName: { contains: search, mode: 'insensitive' } },
        { deviceId: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ]
    }

    const devices = await this.prisma.cameraDevice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return devices.map(device => this.formatResponse(device))
  }

  async findOne(id: string) {
    const device = await this.prisma.cameraDevice.findUnique({
      where: { id },
    })

    if (!device) {
      throw new NotFoundException('Camera device not found')
    }

    return this.formatResponse(device)
  }

  async findByDeviceId(deviceId: string) {
    const device = await this.prisma.cameraDevice.findUnique({
      where: { deviceId },
    })

    if (!device) {
      throw new NotFoundException('Camera device not found')
    }

    return this.formatResponse(device)
  }

  async update(id: string, updateDto: UpdateCameraDeviceDto) {
    const device = await this.prisma.cameraDevice.findUnique({
      where: { id },
    })

    if (!device) {
      throw new NotFoundException('Camera device not found')
    }

    // Check if deviceId is being updated and if it conflicts
    if (updateDto.deviceId && updateDto.deviceId !== device.deviceId) {
      const existing = await this.prisma.cameraDevice.findUnique({
        where: { deviceId: updateDto.deviceId },
      })

      if (existing) {
        throw new ConflictException('Device ID already exists')
      }
    }

    const updateData: any = {}
    if (updateDto.deviceName !== undefined) updateData.deviceName = updateDto.deviceName
    if (updateDto.deviceId !== undefined) updateData.deviceId = updateDto.deviceId
    if (updateDto.location !== undefined) updateData.location = updateDto.location
    if (updateDto.ipAddress !== undefined) updateData.ipAddress = updateDto.ipAddress
    if (updateDto.port !== undefined) updateData.port = updateDto.port
    if (updateDto.status !== undefined) updateData.status = updateDto.status
    if (updateDto.recognitionAccuracy !== undefined) updateData.recognitionAccuracy = updateDto.recognitionAccuracy
    if (updateDto.isEnabled !== undefined) updateData.isEnabled = updateDto.isEnabled
    if (updateDto.model !== undefined) updateData.model = updateDto.model
    if (updateDto.firmwareVersion !== undefined) updateData.firmwareVersion = updateDto.firmwareVersion

    // Update lastConnected if status is being set to ACTIVE
    if (updateDto.status === 'ACTIVE' || (updateDto.isEnabled && device.status === 'INACTIVE')) {
      updateData.lastConnected = new Date()
    }

    const updated = await this.prisma.cameraDevice.update({
      where: { id },
      data: updateData,
    })

    return this.formatResponse(updated)
  }

  async toggleStatus(id: string) {
    const device = await this.prisma.cameraDevice.findUnique({
      where: { id },
    })

    if (!device) {
      throw new NotFoundException('Camera device not found')
    }

    const newEnabled = !device.isEnabled
    const newStatus = newEnabled ? 'ACTIVE' : 'INACTIVE'

    const updated = await this.prisma.cameraDevice.update({
      where: { id },
      data: {
        isEnabled: newEnabled,
        status: newStatus as any,
        lastConnected: newEnabled ? new Date() : device.lastConnected,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const device = await this.prisma.cameraDevice.findUnique({
      where: { id },
    })

    if (!device) {
      throw new NotFoundException('Camera device not found')
    }

    await this.prisma.cameraDevice.delete({
      where: { id },
    })

    return { message: 'Camera device deleted successfully' }
  }

  private formatResponse(device: any) {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive',
      'OFFLINE': 'Offline',
    }

    return {
      id: device.id,
      deviceName: device.deviceName,
      deviceId: device.deviceId,
      location: device.location,
      ipAddress: device.ipAddress,
      port: device.port,
      status: statusMap[device.status] || device.status,
      lastConnected: device.lastConnected ? device.lastConnected.toISOString() : null,
      recognitionAccuracy: device.recognitionAccuracy,
      isEnabled: device.isEnabled,
      model: device.model || '',
      firmwareVersion: device.firmwareVersion || '',
      createdAt: device.createdAt.toISOString(),
      updatedAt: device.updatedAt.toISOString(),
    }
  }
}

