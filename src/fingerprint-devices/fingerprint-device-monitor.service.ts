import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ZKFingerSDKWrapperService } from './zkfinger-sdk-wrapper.service'
import { FingerprintLogsService } from '../fingerprint-logs/fingerprint-logs.service'

/**
 * Fingerprint Device Monitor Service
 * 
 * This service periodically connects to fingerprint devices and syncs attendance logs.
 * It runs as a background task and automatically fetches new attendance records.
 */
@Injectable()
export class FingerprintDeviceMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FingerprintDeviceMonitorService.name)
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  constructor(
    private prisma: PrismaService,
    private sdkWrapper: ZKFingerSDKWrapperService,
    private logsService: FingerprintLogsService,
  ) {}

  onModuleInit() {
    // Start monitoring when module initializes
    this.startMonitoring()
  }

  onModuleDestroy() {
    // Stop monitoring when module is destroyed
    this.stopMonitoring()
  }

  /**
   * Start monitoring all enabled devices
   */
  startMonitoring() {
    if (this.isMonitoring) {
      this.logger.warn('Monitoring is already running')
      return
    }

    this.isMonitoring = true
    this.logger.log('Starting fingerprint device monitoring...')
    
    // Run initial sync
    this.syncAllDevices()
    
    // Schedule periodic sync every 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.syncAllDevices()
    }, 5 * 60 * 1000) // 5 minutes
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return
    }

    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.logger.log('Stopped fingerprint device monitoring')
  }

  /**
   * Sync attendance from all enabled devices
   */
  async syncAllDevices() {
    try {
      const devices = await this.prisma.fingerprintDevice.findMany({
        where: {
          isEnabled: true,
          status: 'ACTIVE',
        },
      })

      this.logger.log(`Syncing attendance from ${devices.length} devices...`)

      // Sync each device in parallel
      await Promise.allSettled(
        devices.map(device => this.syncDevice(device.id))
      )
    } catch (error) {
      this.logger.error('Error syncing all devices:', error)
    }
  }

  /**
   * Sync attendance from a specific device
   */
  async syncDevice(deviceId: string) {
    const device = await this.prisma.fingerprintDevice.findUnique({
      where: { id: deviceId },
    })

    if (!device) {
      this.logger.error(`Device ${deviceId} not found`)
      return { success: false, error: 'Device not found' }
    }

    if (!device.isEnabled) {
      this.logger.debug(`Device ${device.deviceName} is disabled, skipping sync`)
      return { success: false, error: 'Device is disabled' }
    }

    try {
      this.logger.log(`Syncing attendance from device: ${device.deviceName} (${device.ipAddress})`)

      // Connect to device
      let handle: number
      try {
        handle = await this.sdkWrapper.connect(device)
      } catch (error: any) {
        const errorMessage = error?.message || 'Connection failed'
        this.logger.error(`Failed to connect to device ${device.deviceName}: ${errorMessage}`)
        // Update device status to OFFLINE
        await this.prisma.fingerprintDevice.update({
          where: { id: device.id },
          data: { status: 'OFFLINE' },
        })
        return { success: false, error: errorMessage }
      }

      // Update device status to ACTIVE and lastConnected
      await this.prisma.fingerprintDevice.update({
        where: { id: device.id },
        data: {
          status: 'ACTIVE',
          lastConnected: new Date(),
        },
      })

      // Get attendance logs from device
      const deviceLogs = await this.sdkWrapper.getAttendanceLogs(device.id, 1000)

      if (deviceLogs.length === 0) {
        this.logger.debug(`No new attendance logs from device ${device.deviceName}`)
        return { success: true, synced: 0 }
      }

      this.logger.log(`Found ${deviceLogs.length} attendance logs from device ${device.deviceName}`)

      // Get existing logs to avoid duplicates
      const existingLogs = await this.prisma.fingerprintLog.findMany({
        where: {
          fingerprintDeviceId: device.id,
        },
        select: {
          recognitionTime: true,
        },
        orderBy: { recognitionTime: 'desc' },
        take: 1000,
      })

      const existingTimestamps = new Set(
        existingLogs.map(log => log.recognitionTime.getTime())
      )

      // Process and save new logs
      let syncedCount = 0
      let skippedCount = 0

      for (const deviceLog of deviceLogs) {
        try {
          // Check if log already exists (by timestamp)
          const logTimestamp = new Date(deviceLog.timestamp)
          if (existingTimestamps.has(logTimestamp.getTime())) {
            skippedCount++
            continue
          }

          // Find employee by user ID (device user ID should match employee code or enrollment)
          let employeeMasterId: string | null = null
          
          // Try to find employee by matching device user ID with employee code
          if (deviceLog.userId) {
            // First, try to find by employee code (device user ID is often the employee code)
            const employee = await this.prisma.employeeMaster.findFirst({
              where: {
                employeeCode: deviceLog.userId.toString(),
              },
            })
            if (employee) {
              employeeMasterId = employee.id
            } else {
              // If not found by code, try to find by enrollment
              // Note: This assumes the device user ID matches some identifier in enrollment
              // You may need to adjust this based on your device's user ID format
              const enrollment = await this.prisma.fingerprintEnrollment.findFirst({
                where: {
                  fingerprintDeviceId: device.id,
                },
                include: {
                  employeeMaster: true,
                },
              })
              if (enrollment) {
                employeeMasterId = enrollment.employeeMasterId
              }
            }
          }

          // Determine status based on verify result
          let status = 'UNKNOWN'
          if (deviceLog.verify !== undefined) {
            if (deviceLog.verify === 0 || deviceLog.verify === 1) {
              status = employeeMasterId ? 'RECOGNIZED' : 'UNKNOWN'
            } else {
              status = 'FAILED'
            }
          }

          // Create fingerprint log
          await this.logsService.create({
            fingerprintDeviceId: device.id,
            employeeMasterId: employeeMasterId || undefined,
            recognitionTime: logTimestamp.toISOString(),
            status: status as any,
            confidence: deviceLog.verify !== undefined ? (deviceLog.verify === 0 || deviceLog.verify === 1 ? 95 : 0) : 0,
            fingerprintIndex: deviceLog.fingerIndex || undefined,
            location: device.location,
            remarks: `Synced from device. User ID: ${deviceLog.userId}, State: ${deviceLog.state}, Verify: ${deviceLog.verify}`,
          })

          syncedCount++
        } catch (error) {
          this.logger.error(`Error processing log from device ${device.deviceName}:`, error)
        }
      }

      this.logger.log(
        `Device ${device.deviceName}: Synced ${syncedCount} logs, skipped ${skippedCount} duplicates`
      )

      return {
        success: true,
        synced: syncedCount,
        skipped: skippedCount,
        total: deviceLogs.length,
      }
    } catch (error) {
      this.logger.error(`Error syncing device ${device.deviceName}:`, error)
      // Update device status to OFFLINE on error
      await this.prisma.fingerprintDevice.update({
        where: { id: device.id },
        data: { status: 'OFFLINE' },
      })
      return { success: false, error: error.message }
    }
  }

  /**
   * Manually trigger sync for a specific device
   */
  async manualSync(deviceId: string) {
    return this.syncDevice(deviceId)
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      interval: this.monitoringInterval ? '5 minutes' : null,
    }
  }
}

