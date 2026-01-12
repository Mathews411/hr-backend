import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFingerprintDeviceDto } from './dto/create-fingerprint-device.dto'
import { UpdateFingerprintDeviceDto } from './dto/update-fingerprint-device.dto'

@Injectable()
export class FingerprintDevicesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateFingerprintDeviceDto) {
    // Check if deviceId, serialNumber, or macAddress already exists
    const existingDeviceId = await this.prisma.fingerprintDevice.findUnique({
      where: { deviceId: createDto.deviceId },
    })

    if (existingDeviceId) {
      throw new ConflictException('Device ID already exists')
    }

    const existingSerial = await this.prisma.fingerprintDevice.findUnique({
      where: { serialNumber: createDto.serialNumber },
    })

    if (existingSerial) {
      throw new ConflictException('Serial number already exists')
    }

    const existingMac = await this.prisma.fingerprintDevice.findUnique({
      where: { macAddress: createDto.macAddress },
    })

    if (existingMac) {
      throw new ConflictException('MAC address already exists')
    }

    const device = await this.prisma.fingerprintDevice.create({
      data: {
        deviceName: createDto.deviceName,
        deviceId: createDto.deviceId,
        serialNumber: createDto.serialNumber,
        macAddress: createDto.macAddress,
        location: createDto.location,
        ipAddress: createDto.ipAddress,
        port: createDto.port || 4370,
        status: (createDto.status as any) || 'INACTIVE',
        recognitionAccuracy: createDto.recognitionAccuracy || 0,
        isEnabled: createDto.isEnabled !== undefined ? createDto.isEnabled : true,
        model: createDto.model,
        firmwareVersion: createDto.firmwareVersion,
        algorithm: createDto.algorithm,
        platform: createDto.platform,
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
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { macAddress: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ]
    }

    const devices = await this.prisma.fingerprintDevice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return devices.map(device => this.formatResponse(device))
  }

  async findOne(id: string) {
    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { id },
    })

    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    return this.formatResponse(device)
  }

  async findByDeviceId(deviceId: string) {
    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { deviceId },
    })

    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    return this.formatResponse(device)
  }

  async findBySerialNumber(serialNumber: string) {
    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { serialNumber },
    })

    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    return this.formatResponse(device)
  }

  async update(id: string, updateDto: UpdateFingerprintDeviceDto) {
    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { id },
    })

    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    // Check if deviceId, serialNumber, or macAddress is being updated and if it conflicts
    if (updateDto.deviceId && updateDto.deviceId !== device.deviceId) {
      const existing = await this.prisma.fingerprintDevice.findUnique({
        where: { deviceId: updateDto.deviceId },
      })

      if (existing) {
        throw new ConflictException('Device ID already exists')
      }
    }

    if (updateDto.serialNumber && updateDto.serialNumber !== device.serialNumber) {
      const existing = await this.prisma.fingerprintDevice.findUnique({
        where: { serialNumber: updateDto.serialNumber },
      })

      if (existing) {
        throw new ConflictException('Serial number already exists')
      }
    }

    if (updateDto.macAddress && updateDto.macAddress !== device.macAddress) {
      const existing = await this.prisma.fingerprintDevice.findUnique({
        where: { macAddress: updateDto.macAddress },
      })

      if (existing) {
        throw new ConflictException('MAC address already exists')
      }
    }

    const updateData: any = {}
    if (updateDto.deviceName !== undefined) updateData.deviceName = updateDto.deviceName
    if (updateDto.deviceId !== undefined) updateData.deviceId = updateDto.deviceId
    if (updateDto.serialNumber !== undefined) updateData.serialNumber = updateDto.serialNumber
    if (updateDto.macAddress !== undefined) updateData.macAddress = updateDto.macAddress
    if (updateDto.location !== undefined) updateData.location = updateDto.location
    if (updateDto.ipAddress !== undefined) updateData.ipAddress = updateDto.ipAddress
    if (updateDto.port !== undefined) updateData.port = updateDto.port
    if (updateDto.status !== undefined) updateData.status = updateDto.status
    if (updateDto.recognitionAccuracy !== undefined) updateData.recognitionAccuracy = updateDto.recognitionAccuracy
    if (updateDto.isEnabled !== undefined) updateData.isEnabled = updateDto.isEnabled
    if (updateDto.model !== undefined) updateData.model = updateDto.model
    if (updateDto.firmwareVersion !== undefined) updateData.firmwareVersion = updateDto.firmwareVersion
    if (updateDto.algorithm !== undefined) updateData.algorithm = updateDto.algorithm
    if (updateDto.platform !== undefined) updateData.platform = updateDto.platform

    // Update lastConnected if status is being set to ACTIVE
    if (updateDto.status === 'ACTIVE' || (updateDto.isEnabled && device.status === 'INACTIVE')) {
      updateData.lastConnected = new Date()
    }

    const updated = await this.prisma.fingerprintDevice.update({
      where: { id },
      data: updateData,
    })

    return this.formatResponse(updated)
  }

  async toggleStatus(id: string) {
    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { id },
    })

    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    const newEnabled = !device.isEnabled
    const newStatus = newEnabled ? 'ACTIVE' : 'INACTIVE'

    const updated = await this.prisma.fingerprintDevice.update({
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
    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { id },
    })

    if (!device) {
      throw new NotFoundException('Fingerprint device not found')
    }

    await this.prisma.fingerprintDevice.delete({
      where: { id },
    })

    return { message: 'Fingerprint device deleted successfully' }
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
      serialNumber: device.serialNumber,
      macAddress: device.macAddress,
      location: device.location,
      ipAddress: device.ipAddress,
      port: device.port,
      status: statusMap[device.status] || device.status,
      lastConnected: device.lastConnected ? device.lastConnected.toISOString() : null,
      recognitionAccuracy: device.recognitionAccuracy,
      isEnabled: device.isEnabled,
      model: device.model || '',
      firmwareVersion: device.firmwareVersion || '',
      algorithm: device.algorithm || '',
      platform: device.platform || '',
      createdAt: device.createdAt.toISOString(),
      updatedAt: device.updatedAt.toISOString(),
    }
  }
}

