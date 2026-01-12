import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDailyLogDto } from './dto/create-daily-log.dto'
import { UpdateDailyLogDto } from './dto/update-daily-log.dto'
import { DailyLogStatus } from '@prisma/client'

@Injectable()
export class DailyLogsService {
  constructor(private prisma: PrismaService) {}

  async create(createDailyLogDto: CreateDailyLogDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: createDailyLogDto.projectId },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // Check if employee exists (could be Employee or EmployeeMaster ID)
    let employee = await this.prisma.employee.findUnique({
      where: { id: createDailyLogDto.employeeId },
    })

    // If not found, try to find/create from EmployeeMaster
    if (!employee) {
      const employeeMaster = await this.prisma.employeeMaster.findUnique({
        where: { id: createDailyLogDto.employeeId },
      })

      if (!employeeMaster) {
        throw new NotFoundException('Employee not found')
      }

      // Check if Employee record exists with this employeeCode
      employee = await this.prisma.employee.findUnique({
        where: { employeeId: employeeMaster.employeeCode },
      })

      // Create Employee record if it doesn't exist
      if (!employee) {
        employee = await this.prisma.employee.create({
          data: {
            employeeId: employeeMaster.employeeCode,
            name: `${employeeMaster.firstName} ${employeeMaster.lastName}`,
            email: employeeMaster.email,
            phone: employeeMaster.phone,
            department: employeeMaster.departmentId || null,
            designation: employeeMaster.designationId || null,
            status: employeeMaster.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          },
        })
      }
    }

    const dailyLog = await this.prisma.dailyLog.create({
      data: {
        projectId: createDailyLogDto.projectId,
        employeeId: employee.id, // Use the Employee.id, not the EmployeeMaster.id
        logDate: new Date(createDailyLogDto.logDate),
        hoursWorked: createDailyLogDto.hoursWorked,
        taskDescription: createDailyLogDto.taskDescription,
        activityType: createDailyLogDto.activityType,
        status: createDailyLogDto.status || DailyLogStatus.COMPLETED,
        notes: createDailyLogDto.notes,
      },
      include: {
        employee: true,
        project: true,
      },
    })

    return this.formatDailyLogResponse(dailyLog)
  }

  async findAll(projectId?: string, employeeId?: string, startDate?: string, endDate?: string) {
    const where: any = {}
    if (projectId) where.projectId = projectId
    
    // Handle employeeId - could be Employee ID or EmployeeMaster ID
    if (employeeId) {
      // First try to find Employee with this ID
      let employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
      })

      // If not found, try to find EmployeeMaster and get corresponding Employee
      if (!employee) {
        const employeeMaster = await this.prisma.employeeMaster.findUnique({
          where: { id: employeeId },
        })

        if (employeeMaster) {
          // Find Employee by employeeCode
          employee = await this.prisma.employee.findUnique({
            where: { employeeId: employeeMaster.employeeCode },
          })
        }
      }

      // Use Employee.id for filtering
      if (employee) {
        where.employeeId = employee.id
      } else {
        // If employee not found, return empty array
        return []
      }
    }
    
    if (startDate || endDate) {
      where.logDate = {}
      if (startDate) where.logDate.gte = new Date(startDate)
      if (endDate) where.logDate.lte = new Date(endDate)
    }

    const dailyLogs = await this.prisma.dailyLog.findMany({
      where,
      include: {
        employee: true,
        project: true,
      },
      orderBy: { logDate: 'desc' },
    })

    return dailyLogs.map(log => this.formatDailyLogResponse(log))
  }

  async findOne(id: string) {
    const dailyLog = await this.prisma.dailyLog.findUnique({
      where: { id },
      include: {
        employee: true,
        project: true,
      },
    })

    if (!dailyLog) {
      throw new NotFoundException('Daily log not found')
    }

    return this.formatDailyLogResponse(dailyLog)
  }

  async update(id: string, updateDailyLogDto: UpdateDailyLogDto) {
    const dailyLog = await this.prisma.dailyLog.findUnique({
      where: { id },
    })

    if (!dailyLog) {
      throw new NotFoundException('Daily log not found')
    }

    const updateData: any = { ...updateDailyLogDto }
    if (updateDailyLogDto.logDate) {
      updateData.logDate = new Date(updateDailyLogDto.logDate)
    }

    // If employeeId is being updated, handle EmployeeMaster ID conversion
    if (updateDailyLogDto.employeeId) {
      let employee = await this.prisma.employee.findUnique({
        where: { id: updateDailyLogDto.employeeId },
      })

      // If not found, try to find/create from EmployeeMaster
      if (!employee) {
        const employeeMaster = await this.prisma.employeeMaster.findUnique({
          where: { id: updateDailyLogDto.employeeId },
        })

        if (!employeeMaster) {
          throw new NotFoundException('Employee not found')
        }

        // Check if Employee record exists with this employeeCode
        employee = await this.prisma.employee.findUnique({
          where: { employeeId: employeeMaster.employeeCode },
        })

        // Create Employee record if it doesn't exist
        if (!employee) {
          employee = await this.prisma.employee.create({
            data: {
              employeeId: employeeMaster.employeeCode,
              name: `${employeeMaster.firstName} ${employeeMaster.lastName}`,
              email: employeeMaster.email,
              phone: employeeMaster.phone,
              department: employeeMaster.departmentId || null,
              designation: employeeMaster.designationId || null,
              status: employeeMaster.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
            },
          })
        }
      }

      // Use the Employee.id, not the EmployeeMaster.id
      updateData.employeeId = employee.id
    }

    const updated = await this.prisma.dailyLog.update({
      where: { id },
      data: updateData,
      include: {
        employee: true,
        project: true,
      },
    })

    return this.formatDailyLogResponse(updated)
  }

  async remove(id: string) {
    const dailyLog = await this.prisma.dailyLog.findUnique({
      where: { id },
    })

    if (!dailyLog) {
      throw new NotFoundException('Daily log not found')
    }

    await this.prisma.dailyLog.delete({
      where: { id },
    })
  }

  private formatDailyLogResponse(log: any) {
    return {
      id: log.id,
      projectId: log.projectId,
      projectName: log.project.name,
      projectCode: log.project.code,
      employeeId: log.employeeId,
      employeeName: log.employee.name,
      employeeCode: log.employee.employeeId,
      logDate: log.logDate.toISOString().split('T')[0],
      hoursWorked: log.hoursWorked,
      taskDescription: log.taskDescription,
      activityType: log.activityType,
      status: log.status === DailyLogStatus.COMPLETED ? 'Completed' :
              log.status === DailyLogStatus.IN_PROGRESS ? 'In Progress' :
              log.status === DailyLogStatus.BLOCKED ? 'Blocked' : 'On Hold',
      notes: log.notes || '',
      createdDate: log.createdAt.toISOString().split('T')[0],
      updatedDate: log.updatedAt.toISOString().split('T')[0],
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    }
  }
}
