/**
 * TEMPLATE CODE FOR SDK INTEGRATION
 * 
 * Copy the relevant sections from this file to:
 * backend/src/fingerprint-devices/zkfinger-sdk-wrapper.service.ts
 * 
 * Replace the placeholder implementations with this actual SDK code.
 */

import { Injectable, Logger } from '@nestjs/common'
import { FingerprintDevice } from '@prisma/client'
import ffi from 'ffi-napi'
import ref from 'ref-napi'
import Struct from 'ref-struct-napi'
import * as path from 'path'

@Injectable()
export class ZKFingerSDKWrapperService {
  private readonly logger = new Logger(ZKFingerSDKWrapperService.name)
  private connectedDevices: Map<string, number> = new Map()

  // ============================================
  // STEP 1: Define SDK Function Signatures
  // ============================================
  // Add this code at the top of the class or as a module-level constant
  
  private zkfinger = ffi.Library(
    // Adjust path based on your SDK location
    process.platform === 'win32' 
      ? path.join(__dirname, '../../libs/zkfinger/ZKFinger.dll')
      : path.join(__dirname, '../../libs/zkfinger/libzkfinger.so'),
    {
      // Connect to device via TCP/IP
      // Returns: handle (positive) or error code (negative)
      'Connect_Net': ['int', ['string', 'int']],
      
      // Disconnect from device
      // Returns: 0 = success, negative = error
      'Disconnect': ['int', ['int']],
      
      // Set user information on device
      // Parameters: handle, userId, privilege, name, password, enabled
      // Returns: 0 = success, negative = error
      'SetUserInfo': ['int', ['int', 'int', 'string', 'string', 'int']],
      
      // Delete user from device
      // Returns: 0 = success, negative = error
      'DeleteUser': ['int', ['int', 'int']],
      
      // Start fingerprint enrollment
      // This will prompt device to wait for fingerprint
      // Returns: 0 = success, negative = error
      'EnrollFinger': ['int', ['int', 'int', 'int']],
      
      // Get fingerprint template
      // Parameters: handle, userId, fingerIndex, templateBuffer, sizeBuffer
      // Returns: 0 = success, negative = error
      'GetFingerprintTemplate': ['int', ['int', 'int', 'int', 'pointer', 'pointer']],
      
      // Get attendance log count
      // Returns: 0 = success, negative = error
      'GetAttLogCount': ['int', ['int', 'pointer']],
      
      // Get attendance log
      // Parameters: handle, uid, state, verify, year, month, day, hour, minute, second
      // Returns: 0 = success, negative = error
      'GetAttLog': ['int', ['int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']],
      
      // Clear attendance logs
      // Returns: 0 = success, negative = error
      'ClearAttLog': ['int', ['int']],
      
      // Set device time
      // Parameters: handle, year, month, day, hour, minute, second
      // Returns: 0 = success, negative = error
      'SetDeviceTime': ['int', ['int', 'int', 'int', 'int', 'int', 'int']],
    }
  )

  // ============================================
  // STEP 2: Implement Connect Function
  // ============================================
  
  async connect(device: FingerprintDevice): Promise<number> {
    try {
      this.logger.log(`Connecting to device ${device.deviceName} at ${device.ipAddress}:${device.port}`)
      
      const handle = this.zkfinger.Connect_Net(device.ipAddress, device.port)
      
      if (handle < 0) {
        const errorMessages: Record<number, string> = {
          -1: 'Connection failed - Invalid IP or port',
          -2: 'Connection failed - Network error',
          -3: 'Connection failed - Device not found',
        }
        throw new Error(errorMessages[handle] || `Connection failed with error code: ${handle}`)
      }
      
      this.connectedDevices.set(device.id, handle)
      this.logger.log(`Connected to device ${device.deviceName} with handle ${handle}`)
      return handle
    } catch (error) {
      this.logger.error(`Failed to connect to device ${device.deviceName}:`, error)
      throw error
    }
  }

  // ============================================
  // STEP 3: Implement Disconnect Function
  // ============================================
  
  async disconnect(deviceId: string): Promise<void> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      this.logger.warn(`Device ${deviceId} not connected`)
      return
    }

    try {
      const result = this.zkfinger.Disconnect(handle)
      if (result !== 0) {
        this.logger.warn(`Disconnect returned error code: ${result}`)
      }
      this.connectedDevices.delete(deviceId)
      this.logger.log(`Disconnected from device ${deviceId}`)
    } catch (error) {
      this.logger.error(`Failed to disconnect from device ${deviceId}:`, error)
      throw error
    }
  }

  // ============================================
  // STEP 4: Implement Add User Function
  // ============================================
  
  async addUser(deviceId: string, userId: number, userName: string, privilege: number = 0): Promise<void> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      const result = this.zkfinger.SetUserInfo(handle, userId, privilege, userName, '', 1)
      if (result !== 0) {
        throw new Error(`Failed to add user: SDK returned error code ${result}`)
      }
      this.logger.log(`User ${userId} (${userName}) added to device ${deviceId}`)
    } catch (error) {
      this.logger.error(`Failed to add user to device ${deviceId}:`, error)
      throw error
    }
  }

  // ============================================
  // STEP 5: Implement Enroll Fingerprint Function
  // ============================================
  // THIS IS THE MOST IMPORTANT FUNCTION
  
  async enrollFingerprint(deviceId: string, userId: number, fingerIndex: number = 1): Promise<string> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      this.logger.log(`Starting fingerprint enrollment for user ${userId}, finger ${fingerIndex}`)
      this.logger.log(`Please place finger on device scanner now...`)
      
      // Step 1: Start enrollment - device will wait for fingerprint
      const enrollResult = this.zkfinger.EnrollFinger(handle, userId, fingerIndex)
      if (enrollResult !== 0) {
        throw new Error(`Failed to start enrollment: SDK returned error code ${enrollResult}`)
      }
      
      // Step 2: Wait for device to capture fingerprint
      this.logger.log(`Waiting for fingerprint capture... Place finger on device now!`)
      
      let captureComplete = false
      let attempts = 0
      const maxAttempts = 60 // 60 seconds timeout
      
      while (!captureComplete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        // Try to get template - if successful, fingerprint was captured
        if (attempts >= 3) { // Wait at least 3 seconds
          try {
            const templateBuffer = Buffer.alloc(2048)
            const sizeBuffer = Buffer.alloc(4)
            const getResult = this.zkfinger.GetFingerprintTemplate(handle, userId, fingerIndex, templateBuffer, sizeBuffer)
            
            if (getResult === 0) {
              const templateSize = sizeBuffer.readInt32LE(0)
              if (templateSize > 0) {
                captureComplete = true
              }
            }
          } catch (e) {
            // Template not ready yet, continue waiting
          }
        }
        attempts++
      }
      
      if (!captureComplete) {
        throw new Error('Fingerprint capture timeout. Please place finger on device and try again.')
      }
      
      // Step 3: Get the captured template
      const templateBuffer = Buffer.alloc(2048)
      const sizeBuffer = Buffer.alloc(4)
      const getResult = this.zkfinger.GetFingerprintTemplate(handle, userId, fingerIndex, templateBuffer, sizeBuffer)
      
      if (getResult !== 0) {
        throw new Error(`Failed to get fingerprint template: SDK returned error code ${getResult}`)
      }
      
      const templateSize = sizeBuffer.readInt32LE(0)
      if (templateSize === 0) {
        throw new Error('Fingerprint template is empty. Please try enrollment again.')
      }
      
      const templateData = templateBuffer.slice(0, templateSize)
      const template = templateData.toString('base64')
      
      this.logger.log(`Fingerprint enrolled successfully for user ${userId}, finger ${fingerIndex}`)
      return template
      
    } catch (error) {
      this.logger.error(`Failed to enroll fingerprint:`, error)
      throw error
    }
  }

  // ============================================
  // STEP 6: Implement Get Attendance Logs
  // ============================================
  
  async getAttendanceLogs(deviceId: string, limit: number = 1000): Promise<any[]> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      const logs: any[] = []
      
      // Get log count
      const countBuffer = Buffer.alloc(4)
      const countResult = this.zkfinger.GetAttLogCount(handle, countBuffer)
      if (countResult !== 0) {
        throw new Error(`Failed to get log count: SDK returned error code ${countResult}`)
      }
      
      const logCount = countBuffer.readInt32LE(0)
      const logsToFetch = Math.min(logCount, limit)
      
      // Allocate buffers
      const uidBuffer = Buffer.alloc(4)
      const stateBuffer = Buffer.alloc(4)
      const verifyBuffer = Buffer.alloc(4)
      const yearBuffer = Buffer.alloc(4)
      const monthBuffer = Buffer.alloc(4)
      const dayBuffer = Buffer.alloc(4)
      const hourBuffer = Buffer.alloc(4)
      const minuteBuffer = Buffer.alloc(4)
      const secondBuffer = Buffer.alloc(4)
      
      // Fetch logs
      for (let i = 0; i < logsToFetch; i++) {
        const result = this.zkfinger.GetAttLog(
          handle,
          uidBuffer,
          stateBuffer,
          verifyBuffer,
          yearBuffer,
          monthBuffer,
          dayBuffer,
          hourBuffer,
          minuteBuffer,
          secondBuffer
        )
        
        if (result === 0) {
          logs.push({
            userId: uidBuffer.readInt32LE(0),
            state: stateBuffer.readInt32LE(0),
            verify: verifyBuffer.readInt32LE(0),
            timestamp: new Date(
              yearBuffer.readInt32LE(0),
              monthBuffer.readInt32LE(0) - 1,
              dayBuffer.readInt32LE(0),
              hourBuffer.readInt32LE(0),
              minuteBuffer.readInt32LE(0),
              secondBuffer.readInt32LE(0)
            ),
            fingerIndex: verifyBuffer.readInt32LE(0) & 0x0F,
          })
        } else {
          break
        }
      }
      
      return logs
    } catch (error) {
      this.logger.error(`Failed to get attendance logs:`, error)
      throw error
    }
  }

  // Helper methods
  isConnected(deviceId: string): boolean {
    return this.connectedDevices.has(deviceId)
  }

  getHandle(deviceId: string): number | null {
    return this.connectedDevices.get(deviceId) || null
  }
}

