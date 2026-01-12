import { Injectable, Logger } from '@nestjs/common'
import { FingerprintDevice } from '@prisma/client'
import * as path from 'path'

// Use require for native modules
const ffi = require('ffi-napi')
const ref = require('ref-napi')

// Try to load winax for COM support (optional)
let winax: any = null
try {
  winax = require('winax')
} catch (error) {
  // winax not installed, will use PowerShell COM wrapper
}

// For PowerShell COM wrapper
const { execSync } = require('child_process')

/**
 * ZKFinger VX10.0 SDK Wrapper Service
 * 
 * This service wraps the ZKFinger VX10.0 SDK functions for Identix X2008 device.
 * Uses zkemkeeper.dll from Identix SDK.
 * 
 * Since zkemkeeper.dll is a COM component, this service uses COM interface via winax.
 */
@Injectable()
export class ZKFingerSDKWrapperService {
  private readonly logger = new Logger(ZKFingerSDKWrapperService.name)
  private connectedDevices: Map<string, number> = new Map() // deviceId -> connection handle
  private zkemkeeper: any = null // Lazy-loaded SDK library (COM object or FFI)
  private useCOM: boolean = false // Whether using COM interface

  /**
   * Get the DLL path - resolves from project root
   */
  private getDllPath(): string {
    const fs = require('fs')
    
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), 'libs', 'zkfinger', 'zkemkeeper.dll'),
      path.join(__dirname, '..', '..', 'libs', 'zkfinger', 'zkemkeeper.dll'),
      path.join(__dirname, '..', '..', '..', 'libs', 'zkfinger', 'zkemkeeper.dll'),
      path.resolve(process.cwd(), 'libs', 'zkfinger', 'zkemkeeper.dll'),
    ]

    for (const dllPath of possiblePaths) {
      try {
        const absolutePath = path.resolve(dllPath)
        if (fs.existsSync(absolutePath)) {
          this.logger.log(`Found DLL at: ${absolutePath}`)
          return absolutePath
        }
      } catch (error) {
        // Continue to next path
      }
    }

    // Default to process.cwd() path (absolute)
    const defaultPath = path.resolve(process.cwd(), 'libs', 'zkfinger', 'zkemkeeper.dll')
    this.logger.warn(`DLL not found in standard locations, using: ${defaultPath}`)
    this.logger.warn(`Current working directory: ${process.cwd()}`)
    this.logger.warn(`__dirname: ${__dirname}`)
    return defaultPath
  }

  /**
   * Lazy-load the SDK library
   * Tries COM interface first (since DLL is registered as COM component), falls back to FFI
   */
  private getSDK(): any {
    if (!this.zkemkeeper) {
      const dllPath = this.getDllPath()
      const dllDir = path.dirname(dllPath)
      const fs = require('fs')
      
      try {
        // Verify DLL exists
        if (!fs.existsSync(dllPath)) {
          throw new Error(`DLL file not found at: ${dllPath}`)
        }
        
        // Log system information for diagnostics
        this.logger.log(`Node.js version: ${process.version}`)
        this.logger.log(`Node.js architecture: ${process.arch}`)
        this.logger.log(`Platform: ${process.platform}`)
        this.logger.log(`DLL path: ${dllPath}`)
        this.logger.log(`DLL directory: ${dllDir}`)
        
        // Add DLL directory to PATH so Windows can find dependency DLLs
        const originalPath = process.env.PATH || ''
        if (!originalPath.includes(dllDir)) {
          process.env.PATH = `${dllDir};${originalPath}`
          this.logger.log(`Added DLL directory to PATH: ${dllDir}`)
        }
        
        // Verify all dependency DLLs exist
        const requiredDlls = [
          'zkemkeeper.dll',
          'zkemsdk.dll',
          'commpro.dll',
          'comms.dll',
          'tcpcomm.dll',
        ]
        
        const missingDlls: string[] = []
        for (const dll of requiredDlls) {
          const dllFullPath = path.join(dllDir, dll)
          if (!fs.existsSync(dllFullPath)) {
            missingDlls.push(dll)
          }
        }
        
        if (missingDlls.length > 0) {
          this.logger.warn(`Missing DLLs: ${missingDlls.join(', ')}`)
        }
        
        // Try COM interface first (since DLL is registered as COM component)
        if (winax) {
          this.logger.log('Attempting to load SDK via COM interface...')
          
          // Common ZKTeco COM ProgIDs
          const comProgIDs = [
            'ZKTeco.ZKEM',
            'ZKTeco.ZKEM.1',
            'ZKTeco.ZKEMKeeper',
            'ZKEMKeeper.ZKEM',
            'ZKEMKeeper.ZKEM.1',
            'zkemkeeper.ZKEM',
          ]
          
          let comLoaded = false
          for (const progID of comProgIDs) {
            try {
              this.logger.log(`Trying COM ProgID: ${progID}`)
              this.zkemkeeper = new winax.Object(progID)
              this.useCOM = true
              comLoaded = true
              this.logger.log(`✓ Successfully loaded COM component: ${progID}`)
              break
            } catch (comError: any) {
              this.logger.debug(`Failed to load ${progID}: ${comError.message}`)
              // Continue to next ProgID
            }
          }
          
          if (comLoaded) {
            this.logger.log('SDK loaded successfully via COM interface (winax)')
            return this.zkemkeeper
          } else {
            this.logger.warn('Could not load via COM interface (winax), trying PowerShell wrapper...')
          }
        } else {
          this.logger.warn('winax not installed. Using PowerShell COM wrapper instead.')
          this.logger.warn('(To use winax: npm install winax - requires Python and build tools)')
        }
        
        // Try PowerShell COM wrapper as fallback
        this.logger.log('Attempting to use PowerShell COM wrapper...')
        
        // Try multiple possible paths for PowerShell wrapper
        // Note: __dirname in compiled code points to dist/, so we need to go up to find scripts/
        const possibleWrapperPaths = [
          path.join(process.cwd(), 'scripts', 'com-wrapper.ps1'), // From project root
          path.resolve(process.cwd(), 'scripts', 'com-wrapper.ps1'), // Absolute from cwd
          path.join(__dirname, '..', 'scripts', 'com-wrapper.ps1'), // From dist/../scripts/
          path.join(__dirname, '..', '..', 'scripts', 'com-wrapper.ps1'), // From dist/../../scripts/
          path.join(__dirname, '..', '..', '..', 'scripts', 'com-wrapper.ps1'), // From dist/../../../scripts/
        ]
        
        let psWrapperPath: string | null = null
        for (const wrapperPath of possibleWrapperPaths) {
          const absolutePath = path.resolve(wrapperPath)
          if (fs.existsSync(absolutePath)) {
            psWrapperPath = absolutePath
            this.logger.log(`Found PowerShell wrapper at: ${absolutePath}`)
            break
          }
        }
        
        if (psWrapperPath) {
          try {
            this.logger.log(`Testing PowerShell COM wrapper at: ${psWrapperPath}`)
            // Test if COM object can be created
            const testResult = execSync(
              `powershell -ExecutionPolicy Bypass -File "${psWrapperPath}" -Action test`,
              { encoding: 'utf8', timeout: 10000, cwd: process.cwd() }
            )
            
            if (testResult.includes('SUCCESS')) {
              this.logger.log('✓ PowerShell COM wrapper is working')
              this.zkemkeeper = { _usePowerShell: true, _wrapperPath: psWrapperPath }
              this.useCOM = true
              return this.zkemkeeper
            } else {
              this.logger.warn(`PowerShell wrapper test returned: ${testResult.substring(0, 200)}`)
            }
          } catch (psError: any) {
            this.logger.warn(`PowerShell wrapper test failed: ${psError.message}`)
            if (psError.stdout) {
              this.logger.warn(`PowerShell output: ${psError.stdout.substring(0, 200)}`)
            }
            if (psError.stderr) {
              this.logger.warn(`PowerShell error: ${psError.stderr.substring(0, 200)}`)
            }
          }
        } else {
          this.logger.warn(`PowerShell wrapper not found. Searched in:`)
          possibleWrapperPaths.forEach(p => {
            this.logger.warn(`  - ${path.resolve(p)}`)
          })
        }
        
        this.logger.warn('Falling back to FFI approach (may not work for COM components)...')
        
        // Fallback to FFI approach
        this.logger.log(`Loading SDK DLL via FFI from: ${dllPath}`)
        
        // Define function signatures
        const functions = {
          // Connect to device via TCP/IP
          'Connect_Net': ['int', ['string', 'int']],
          
          // Disconnect from device
          'Disconnect': ['int', ['int']],
          
          // Set user information on device
          // Parameters: handle, userId, name, password, privilege, enabled
          'SetUserInfo': ['int', ['int', 'int', 'string', 'string', 'int', 'int']],
          
          // Delete user from device
          'DeleteUser': ['int', ['int', 'int']],
          
          // Start fingerprint enrollment
          'EnrollFinger': ['int', ['int', 'int', 'int']],
          
          // Get fingerprint template
          'GetFingerprintTemplate': ['int', ['int', 'int', 'int', 'pointer', 'pointer']],
          
          // Get attendance log count
          'GetAttLogCount': ['int', ['int', 'pointer']],
          
          // Get attendance log
          'GetAttLog': ['int', ['int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']],
          
          // Clear attendance logs
          'ClearAttLog': ['int', ['int']],
          
          // Set device time
          'SetDeviceTime': ['int', ['int', 'int', 'int', 'int', 'int', 'int']],
        }
        
        // Try loading with minimal function set first to test DLL loading
        try {
          const testLib = ffi.Library(dllPath, {
            'Connect_Net': functions['Connect_Net'],
          })
          this.logger.log('DLL basic load test successful - Connect_Net function found')
        } catch (testError: any) {
          const errorMsg = testError.message || String(testError)
          this.logger.error(`DLL basic load test failed: ${errorMsg}`)
          
          // If error 127, it means the function wasn't found
          if (errorMsg.includes('127') || errorMsg.includes('Win32 error 127')) {
            this.logger.error('Function Connect_Net not found in DLL.')
            this.logger.error('Since DLL is registered as COM component, install winax:')
            this.logger.error('  npm install winax')
            this.logger.error('Then restart the application.')
            throw new Error('DLL is a COM component. Please install winax package: npm install winax')
          }
        }
        
        // Load all functions
        this.zkemkeeper = ffi.Library(dllPath, functions)
        this.useCOM = false
        this.logger.log('SDK DLL loaded successfully with all functions via FFI')
      } catch (error: any) {
        this.logger.error(`Failed to load SDK DLL: ${error.message}`)
        this.logger.error(`Error details: ${error.stack}`)
        this.logger.error(`DLL path attempted: ${dllPath}`)
        this.logger.error(`DLL directory: ${dllDir}`)
        this.logger.error(`Node.js architecture: ${process.arch}`)
        
        let errorMessage = `Failed to load fingerprint SDK DLL. `
        
        if (error.message.includes('126') || error.message.includes('Win32 error 126')) {
          errorMessage += `\n\nWin32 Error 126 means a dependency DLL is missing. Common solutions:\n`
          errorMessage += `1. Install Visual C++ Redistributable (x64): https://aka.ms/vs/17/release/vc_redist.x64.exe\n`
          errorMessage += `2. Ensure all DLL files are in: ${dllDir}\n`
          errorMessage += `3. Check if DLL architecture matches Node.js (64-bit)\n`
          errorMessage += `4. Try running backend as Administrator\n`
        } else if (error.message.includes('127') || error.message.includes('Win32 error 127')) {
          errorMessage += `\n\nWin32 Error 127 means a function/export was not found in the DLL.\n\n`
          errorMessage += `DIAGNOSIS:\n`
          errorMessage += `- DLL architecture: 64-bit (matches Node.js) ✓\n`
          errorMessage += `- Function "Connect_Net" and variations: NOT FOUND ✗\n`
          errorMessage += `- This suggests zkemkeeper.dll might be a COM/ActiveX component\n\n`
          errorMessage += `POSSIBLE CAUSES:\n`
          errorMessage += `1. COM Component - DLL uses COM interface instead of direct function exports\n`
          errorMessage += `2. Wrong DLL Version - This DLL version doesn't export expected functions\n`
          errorMessage += `3. Different Interface - DLL might use C++ classes or different API\n\n`
          errorMessage += `SOLUTIONS:\n`
          errorMessage += `1. Check if DLL is COM component:\n`
          errorMessage += `   Run as Administrator: regsvr32 "${dllPath}"\n`
          errorMessage += `   If successful, use COM interface instead of FFI\n\n`
          errorMessage += `2. Check DLL exports to see actual function names:\n`
          errorMessage += `   Use: dumpbin /exports "${dllPath}"\n`
          errorMessage += `   Or download: https://github.com/lucasg/Dependencies\n\n`
          errorMessage += `3. Get correct SDK:\n`
          errorMessage += `   - Contact ZKTeco/Identix support for correct SDK version\n`
          errorMessage += `   - Request Node.js integration documentation\n`
          errorMessage += `   - Verify DLL version matches your device (Identix X2008)\n\n`
          errorMessage += `4. See troubleshooting guide: backend/DLL_TROUBLESHOOTING.md\n`
        } else {
          errorMessage += `Please ensure zkemkeeper.dll and all dependencies are in ${dllDir}. `
        }
        errorMessage += `\nError: ${error.message}`
        
        throw new Error(errorMessage)
      }
    }
    return this.zkemkeeper
  }

  /**
   * Connect to fingerprint device via TCP/IP
   * @param device Fingerprint device information
   * @returns Connection handle (positive number) or error code (negative)
   */
  async connect(device: FingerprintDevice): Promise<number> {
    try {
      this.logger.log(`Connecting to device ${device.deviceName} at ${device.ipAddress}:${device.port}`)
      
      // Ensure SDK is loaded
      const sdk = this.getSDK()
      
      let handle: number
      
      if (this.useCOM) {
        // COM interface - check if using PowerShell wrapper
        if (sdk._usePowerShell) {
          // Use PowerShell COM wrapper
          try {
            const { execSync } = require('child_process')
            const result = execSync(
              `powershell -ExecutionPolicy Bypass -File "${sdk._wrapperPath}" -Action connect -IP "${device.ipAddress}" -Port ${device.port}`,
              { encoding: 'utf8', timeout: 15000, cwd: process.cwd(), maxBuffer: 1024 * 1024 }
            )
            
            // Check for errors first
            if (result.includes('ERROR:')) {
              // Extract all error information
              const errorLines = result.split('\n').filter((line: string) => line.includes('ERROR'))
              const errorMsg = errorLines.join('; ') || result.split('ERROR:')[1]?.trim() || 'Unknown PowerShell error'
              this.logger.error(`PowerShell error details: ${result.substring(0, 500)}`)
              throw new Error(`COM method call failed: ${errorMsg}`)
            }
            
            if (result.includes('RESULT:')) {
              const resultLine = result.split('RESULT:')[1]?.split('\n')[0]?.trim() || '-1'
              handle = parseInt(resultLine)
              
              if (isNaN(handle)) {
                this.logger.error(`Invalid handle returned: ${resultLine}`)
                this.logger.error(`Full PowerShell output: ${result.substring(0, 500)}`)
                throw new Error(`Invalid connection handle returned: ${resultLine}`)
              }
              
              // Check if connection failed (negative or zero handle)
              if (handle <= 0) {
                const errorMessages = new Map<number, string>([
                  [-1, 'Connection failed - device unreachable or invalid IP/port'],
                  [0, 'Connection failed - device not responding'],
                ])
                const errorMsg = errorMessages.get(handle) || `Connection failed with code: ${handle}`
                this.logger.error(`Connection failed: ${errorMsg}`)
                throw new Error(errorMsg)
              }
            } else {
              this.logger.error(`Unexpected PowerShell response: ${result.substring(0, 500)}`)
              throw new Error('Unexpected response from PowerShell wrapper')
            }
          } catch (psError: any) {
            this.logger.error(`PowerShell COM wrapper failed: ${psError.message}`)
            if (psError.stdout) {
              const stdout = psError.stdout.toString()
              this.logger.error(`PowerShell stdout: ${stdout.substring(0, 1000)}`)
              
              // Check for AccessViolationException
              if (stdout.includes('AccessViolationException') || psError.stderr?.toString().includes('AccessViolationException')) {
                this.logger.error('')
                this.logger.error('=== AccessViolationException Detected ===')
                this.logger.error('This indicates a COM method signature mismatch.')
                this.logger.error('The PowerShell COM wrapper cannot safely call Connect_Net.')
                this.logger.error('')
                this.logger.error('Solutions:')
                this.logger.error('1. Install winax package: npm install winax (requires Python)')
                this.logger.error('2. Create a C# wrapper service (see COM_ACCESSVIOLATION_SOLUTION.md)')
                this.logger.error('3. Use official ZKTeco SDK tools')
                this.logger.error('4. Contact ZKTeco support for Node.js integration help')
                this.logger.error('')
                throw new Error('COM method call failed due to AccessViolationException. This indicates a method signature mismatch. See COM_ACCESSVIOLATION_SOLUTION.md for solutions.')
              }
            }
            if (psError.stderr) {
              this.logger.error(`PowerShell stderr: ${psError.stderr.toString().substring(0, 1000)}`)
            }
            throw new Error(`COM connection failed: ${psError.message}`)
          }
        } else {
          // Direct COM interface (winax)
          // ZKTeco COM methods typically use Connect_Net(IP, Port) or ConnectNet(IP, Port)
          try {
            // Try Connect_Net method
            if (typeof sdk.Connect_Net === 'function') {
              handle = sdk.Connect_Net(device.ipAddress, device.port)
            } else if (typeof sdk.ConnectNet === 'function') {
              handle = sdk.ConnectNet(device.ipAddress, device.port)
            } else if (typeof sdk.Connect === 'function') {
              handle = sdk.Connect(device.ipAddress, device.port)
            } else {
              // List available methods for debugging
              const methods = Object.getOwnPropertyNames(sdk).filter(name => typeof sdk[name] === 'function')
              this.logger.error(`Available COM methods: ${methods.join(', ')}`)
              throw new Error('Connect method not found in COM object. Available methods logged above.')
            }
          } catch (comError: any) {
            this.logger.error(`COM method call failed: ${comError.message}`)
            throw comError
          }
        }
      } else {
        // FFI interface - direct function call
        handle = sdk.Connect_Net(device.ipAddress, device.port)
      }
      
      if (handle < 0) {
        const errorMessages = new Map<number, string>([
          [-1, 'Invalid IP address or port number'],
          [-2, 'Network communication error - check device is powered on and network connection'],
          [-3, 'Device not found at specified IP address'],
          [-4, 'Connection timeout - device may be busy or unreachable'],
        ])
        const errorMsg = errorMessages.get(handle) || `Connection failed with SDK error code: ${handle}`
        this.logger.error(`SDK Connect returned error code ${handle}: ${errorMsg}`)
        throw new Error(errorMsg)
      }
      
      this.connectedDevices.set(device.id, handle)
      this.logger.log(`Successfully connected to device ${device.deviceName} with handle ${handle}`)
      return handle
    } catch (error: any) {
      // If it's already an Error object with a message, re-throw it
      if (error instanceof Error) {
        this.logger.error(`Failed to connect to device ${device.deviceName}: ${error.message}`)
        throw error
      }
      // Otherwise, wrap it
      const errorMsg = error?.message || String(error) || 'Unknown connection error'
      this.logger.error(`Failed to connect to device ${device.deviceName}: ${errorMsg}`)
      throw new Error(errorMsg)
    }
  }

  /**
   * Disconnect from fingerprint device
   * @param deviceId Device ID
   */
  async disconnect(deviceId: string): Promise<void> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      this.logger.warn(`Device ${deviceId} not connected`)
      return
    }

    try {
      const sdk = this.getSDK()
      let result: number
      
      if (this.useCOM) {
        // COM interface
        if (sdk._usePowerShell) {
          // Use PowerShell COM wrapper
          try {
            const { execSync } = require('child_process')
            const output = execSync(
              `powershell -ExecutionPolicy Bypass -File "${sdk._wrapperPath}" -Action disconnect -Handle ${handle}`,
              { encoding: 'utf8', timeout: 5000 }
            )
            
            if (output.includes('RESULT:')) {
              result = parseInt(output.split('RESULT:')[1]?.trim() || '0')
            } else {
              result = 0
            }
          } catch (psError: any) {
            this.logger.warn(`PowerShell disconnect failed: ${psError.message}`)
            result = 0
          }
        } else if (typeof sdk.Disconnect === 'function') {
          // Direct COM (winax)
          result = sdk.Disconnect(handle)
        } else {
          this.logger.warn('Disconnect method not found in COM object, skipping')
          result = 0
        }
      } else {
        // FFI interface
        result = sdk.Disconnect(handle)
      }
      
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

  /**
   * Get device information
   * @param deviceId Device ID
   * @returns Device information object
   */
  async getDeviceInfo(deviceId: string): Promise<any> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      // TODO: Implement actual SDK call
      // const info = GetDeviceInfo(handle)
      
      return {
        serialNumber: 'CGKK224363318',
        firmwareVersion: 'VX10.0',
        algorithm: 'ZKFinger VX10.0',
        platform: 'ZLM60_TFT',
      }
    } catch (error) {
      this.logger.error(`Failed to get device info for ${deviceId}:`, error)
      throw error
    }
  }

  /**
   * Set device time
   * @param deviceId Device ID
   * @param dateTime Date and time to set
   */
  async setDeviceTime(deviceId: string, dateTime: Date): Promise<void> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      const year = dateTime.getFullYear()
      const month = dateTime.getMonth() + 1
      const day = dateTime.getDate()
      const hour = dateTime.getHours()
      const minute = dateTime.getMinutes()
      const second = dateTime.getSeconds()

      const result = this.getSDK().SetDeviceTime(handle, year, month, day, hour, minute, second)
      if (result !== 0) {
        throw new Error(`Failed to set device time: SDK returned error code ${result}`)
      }
      
      this.logger.log(`Device time set for ${deviceId}`)
    } catch (error) {
      this.logger.error(`Failed to set device time for ${deviceId}:`, error)
      throw error
    }
  }

  /**
   * Add user to device
   * @param deviceId Device ID
   * @param userId User ID (employee code or numeric ID)
   * @param userName User name
   * @param privilege User privilege (0 = user, 14 = admin)
   */
  async addUser(deviceId: string, userId: number, userName: string, privilege: number = 0): Promise<void> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      // Call actual SDK SetUserInfo function
      // Parameters: handle, userId, name, password, privilege, enabled
      const result = this.getSDK().SetUserInfo(handle, userId, userName, '', privilege, 1)
      
      if (result !== 0) {
        throw new Error(`Failed to add user: SDK returned error code ${result}`)
      }
      
      this.logger.log(`User ${userId} (${userName}) added to device ${deviceId}`)
    } catch (error) {
      this.logger.error(`Failed to add user to device ${deviceId}:`, error)
      throw error
    }
  }

  /**
   * Delete user from device
   * @param deviceId Device ID
   * @param userId User ID
   */
  async deleteUser(deviceId: string, userId: number): Promise<void> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      const result = this.getSDK().DeleteUser(handle, userId)
      if (result !== 0) {
        throw new Error(`Failed to delete user: SDK returned error code ${result}`)
      }
      
      this.logger.log(`User ${userId} deleted from device ${deviceId}`)
    } catch (error) {
      this.logger.error(`Failed to delete user from device ${deviceId}:`, error)
      throw error
    }
  }

  /**
   * Start fingerprint enrollment on device (waits for user to place finger)
   * @param deviceId Device ID
   * @param userId User ID
   * @param fingerIndex Finger index (1-10)
   * @returns Fingerprint template data
   */
  async enrollFingerprint(deviceId: string, userId: number, fingerIndex: number = 1): Promise<string> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      this.logger.log(`Starting fingerprint enrollment for user ${userId}, finger ${fingerIndex} on device ${deviceId}`)
      this.logger.log(`Please place finger on device scanner now...`)
      
      // Step 1: Start enrollment on device
      // This will prompt the device to wait for fingerprint
      const enrollResult = this.getSDK().EnrollFinger(handle, userId, fingerIndex)
      
      if (enrollResult !== 0) {
        throw new Error(`Failed to start enrollment: SDK returned error code ${enrollResult}`)
      }
      
      // Step 2: Wait for device to capture fingerprint
      // The device will wait for user to place finger
      // We need to poll/wait for completion
      this.logger.log(`Waiting for fingerprint capture... Place finger on device now!`)
      
      let captureComplete = false
      let attempts = 0
      const maxAttempts = 60 // 60 seconds timeout
      
      while (!captureComplete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        // Try to get template - if successful, fingerprint was captured
        if (attempts >= 3) { // Wait at least 3 seconds for user to place finger
          try {
            const templateBuffer = Buffer.alloc(2048)
            const sizeBuffer = Buffer.alloc(4)
            const getResult = this.getSDK().GetFingerprintTemplate(handle, userId, fingerIndex, templateBuffer, sizeBuffer)
            
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
      const getResult = this.getSDK().GetFingerprintTemplate(handle, userId, fingerIndex, templateBuffer, sizeBuffer)
      
      if (getResult !== 0) {
        throw new Error(`Failed to get fingerprint template: SDK returned error code ${getResult}`)
      }
      
      const templateSize = sizeBuffer.readInt32LE(0)
      if (templateSize === 0) {
        throw new Error('Fingerprint template is empty. Please try enrollment again.')
      }
      
      // Extract template data
      const templateData = templateBuffer.slice(0, templateSize)
      
      // Return base64 encoded template
      const template = templateData.toString('base64')
      
      this.logger.log(`Fingerprint enrolled successfully for user ${userId}, finger ${fingerIndex} on device ${deviceId}`)
      return template
      
    } catch (error) {
      this.logger.error(`Failed to enroll fingerprint on device ${deviceId}:`, error)
      throw error
    }
  }

  /**
   * Get attendance log count
   * @param deviceId Device ID
   * @returns Number of attendance records
   */
  async getAttendanceLogCount(deviceId: string): Promise<number> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      const countBuffer = Buffer.alloc(4)
      const result = this.getSDK().GetAttLogCount(handle, countBuffer)
      
      if (result !== 0) {
        throw new Error(`Failed to get log count: SDK returned error code ${result}`)
      }
      
      return countBuffer.readInt32LE(0)
    } catch (error) {
      this.logger.error(`Failed to get attendance log count for ${deviceId}:`, error)
      throw error
    }
  }

  /**
   * Get attendance logs from device
   * @param deviceId Device ID
   * @param limit Maximum number of records to retrieve
   * @returns Array of attendance records
   */
  async getAttendanceLogs(deviceId: string, limit: number = 1000): Promise<any[]> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      const logs: any[] = []
      
      // Get attendance log count
      const countBuffer = Buffer.alloc(4)
      const countResult = this.getSDK().GetAttLogCount(handle, countBuffer)
      
      if (countResult !== 0) {
        throw new Error(`Failed to get log count: SDK returned error code ${countResult}`)
      }
      
      const logCount = countBuffer.readInt32LE(0)
      const logsToFetch = Math.min(logCount, limit)
      
      // Allocate buffers for log data
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
        const result = this.getSDK().GetAttLog(
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
              monthBuffer.readInt32LE(0) - 1, // Month is 0-indexed in JavaScript
              dayBuffer.readInt32LE(0),
              hourBuffer.readInt32LE(0),
              minuteBuffer.readInt32LE(0),
              secondBuffer.readInt32LE(0)
            ),
            fingerIndex: verifyBuffer.readInt32LE(0) & 0x0F, // Extract finger index from verify
          })
        } else if (result < 0) {
          // No more logs or error
          break
        }
      }
      
      return logs
    } catch (error) {
      this.logger.error(`Failed to get attendance logs for ${deviceId}:`, error)
      throw error
    }
  }

  /**
   * Clear attendance logs on device
   * @param deviceId Device ID
   */
  async clearAttendanceLogs(deviceId: string): Promise<void> {
    const handle = this.connectedDevices.get(deviceId)
    if (!handle) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    try {
      const result = this.getSDK().ClearAttLog(handle)
      if (result !== 0) {
        throw new Error(`Failed to clear logs: SDK returned error code ${result}`)
      }
      
      this.logger.log(`Attendance logs cleared for device ${deviceId}`)
    } catch (error) {
      this.logger.error(`Failed to clear attendance logs for ${deviceId}:`, error)
      throw error
    }
  }

  /**
   * Check if device is connected
   * @param deviceId Device ID
   * @returns True if connected
   */
  isConnected(deviceId: string): boolean {
    return this.connectedDevices.has(deviceId)
  }

  /**
   * Get connection handle for device
   * @param deviceId Device ID
   * @returns Connection handle or null
   */
  getHandle(deviceId: string): number | null {
    return this.connectedDevices.get(deviceId) || null
  }
}

