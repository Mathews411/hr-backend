import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AttendanceLogsService {
  constructor(private prisma: PrismaService) {}

  async getAttendanceLogs(
    employeeMasterId?: string,
    status?: string,
    cameraDeviceId?: string,
    startDate?: string,
    endDate?: string,
    search?: string,
  ) {
    const where: any = {
      status: 'RECOGNIZED', // Only count recognized face recognitions
    }

    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (cameraDeviceId) where.cameraDeviceId = cameraDeviceId
    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (startDate || endDate) {
      where.recognitionTime = {}
      if (startDate) where.recognitionTime.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.recognitionTime.lte = end
      }
    }

    const logs = await this.prisma.faceRecognitionLog.findMany({
      where,
      include: {
        employeeMaster: true,
        cameraDevice: true,
      },
      orderBy: { recognitionTime: 'asc' },
    })

    // Group logs by employee and date
    const attendanceMap = new Map<string, any>()

    for (const log of logs) {
      if (!log.employeeMasterId) continue

      const date = new Date(log.recognitionTime)
      const dateKey = `${log.employeeMasterId}_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      if (!attendanceMap.has(dateKey)) {
        const employee = log.employeeMaster
        let departmentName = 'Not assigned'
        let designationName = 'Not assigned'

        if (employee?.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: employee.departmentId },
          })
          departmentName = department?.departmentName || 'Not assigned'
        }

        if (employee?.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: employee.designationId },
          })
          designationName = designation?.designationName || 'Not assigned'
        }

        attendanceMap.set(dateKey, {
          id: dateKey,
          employeeId: log.employeeMasterId,
          employeeCode: employee?.employeeCode || '',
          employeeName: employee
            ? `${employee.firstName} ${employee.lastName}`
            : 'Unknown',
          department: departmentName,
          designation: designationName,
          recognitionTime: log.recognitionTime.toISOString(),
          checkInTime: null,
          checkOutTime: null,
          workingHours: 0,
          status: 'Absent',
          cameraLocation: log.location || log.cameraDevice?.location || 'Unknown',
          confidence: log.confidence,
          logs: [],
        })
      }

      const attendance = attendanceMap.get(dateKey)
      attendance.logs.push(log)
      
      // Update check-in (first recognition of the day)
      if (!attendance.checkInTime || log.recognitionTime < new Date(attendance.checkInTime)) {
        attendance.checkInTime = log.recognitionTime.toISOString()
        attendance.recognitionTime = log.recognitionTime.toISOString()
        attendance.cameraLocation = log.location || log.cameraDevice?.location || attendance.cameraLocation
        attendance.confidence = log.confidence
      }

      // Update check-out (last recognition of the day)
      if (!attendance.checkOutTime || log.recognitionTime > new Date(attendance.checkOutTime)) {
        attendance.checkOutTime = log.recognitionTime.toISOString()
      }
    }

    // Calculate working hours and determine status
    const attendanceRecords = Array.from(attendanceMap.values()).map(record => {
      if (record.checkInTime && record.checkOutTime) {
        const checkIn = new Date(record.checkInTime)
        const checkOut = new Date(record.checkOutTime)
        const diffMs = checkOut.getTime() - checkIn.getTime()
        record.workingHours = diffMs / (1000 * 60 * 60) // Convert to hours
      }

      // Determine status
      if (!record.checkInTime) {
        record.status = 'Absent'
      } else {
        const checkInHour = new Date(record.checkInTime).getHours()
        const checkInMinute = new Date(record.checkInTime).getMinutes()
        const checkInTimeMinutes = checkInHour * 60 + checkInMinute

        // Assuming 9:00 AM (540 minutes) as standard check-in time
        const standardCheckIn = 9 * 60 // 9:00 AM

        if (checkInTimeMinutes > standardCheckIn + 15) {
          // More than 15 minutes late
          record.status = 'Late'
        } else if (record.checkOutTime) {
          const checkOutHour = new Date(record.checkOutTime).getHours()
          const checkOutMinute = new Date(record.checkOutTime).getMinutes()
          const checkOutTimeMinutes = checkOutHour * 60 + checkOutMinute
          const standardCheckOut = 18 * 60 // 6:00 PM

          if (checkOutTimeMinutes < standardCheckOut - 30) {
            // More than 30 minutes early
            record.status = 'Early Departure'
          } else {
            record.status = 'Present'
          }
        } else {
          record.status = 'Present'
        }
      }

      // Format check-in/check-out times
      if (record.checkInTime) {
        const checkIn = new Date(record.checkInTime)
        record.checkInTime = `${String(checkIn.getHours()).padStart(2, '0')}:${String(checkIn.getMinutes()).padStart(2, '0')}`
      }
      if (record.checkOutTime) {
        const checkOut = new Date(record.checkOutTime)
        record.checkOutTime = `${String(checkOut.getHours()).padStart(2, '0')}:${String(checkOut.getMinutes()).padStart(2, '0')}`
      }

      // Remove logs array from response
      delete record.logs

      return record
    })

    // Filter by status if provided
    let filtered = attendanceRecords
    if (status && status !== 'all') {
      filtered = filtered.filter(record => record.status === status)
    }

    return filtered.sort((a, b) => 
      new Date(b.recognitionTime).getTime() - new Date(a.recognitionTime).getTime()
    )
  }

  async getAttendanceStatistics(startDate?: string, endDate?: string) {
    const logs = await this.getAttendanceLogs(
      undefined,
      undefined,
      undefined,
      startDate,
      endDate,
    )

    const total = logs.length
    const present = logs.filter(l => l.status === 'Present').length
    const late = logs.filter(l => l.status === 'Late').length
    const early = logs.filter(l => l.status === 'Early Departure').length
    const absent = logs.filter(l => l.status === 'Absent').length

    return { total, present, late, early, absent }
  }
}

