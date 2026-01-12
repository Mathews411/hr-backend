import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AttendancePayrollMatchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate attendance days for an employee in a given month
   */
  private async calculateAttendanceDays(employeeId: string, month: string): Promise<number> {
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0) // Last day of the month

    const attendanceRecords = await this.prisma.dailyAttendance.findMany({
      where: {
        employeeMasterId: employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['PRESENT', 'HALF_DAY', 'LATE'], // Count these as attendance days
        },
      },
    })

    // Count full days (PRESENT, LATE) as 1, HALF_DAY as 0.5
    let attendanceDays = 0
    for (const record of attendanceRecords) {
      if (record.status === 'HALF_DAY') {
        attendanceDays += 0.5
      } else {
        attendanceDays += 1
      }
    }

    return Math.round(attendanceDays * 2) / 2 // Round to nearest 0.5
  }

  /**
   * Calculate payroll days for an employee in a given month
   * This should be fetched from your payroll system or calculated based on salary template
   * For now, this is a placeholder - you'll need to implement based on your payroll logic
   */
  private async calculatePayrollDays(employeeId: string, month: string): Promise<number> {
    // TODO: Implement actual payroll days calculation
    // This might come from:
    // 1. A payroll table/record for the month
    // 2. Salary template with working days
    // 3. Monthly payroll processing records
    
    // Placeholder: Return attendance days as default (you should replace this)
    return this.calculateAttendanceDays(employeeId, month)
  }

  /**
   * Calculate attendance amount based on attendance days and salary
   */
  private calculateAttendanceAmount(
    attendanceDays: number,
    monthlySalary: number,
    workingDaysPerMonth: number = 26,
  ): number {
    if (workingDaysPerMonth === 0) return 0
    return Math.round((monthlySalary / workingDaysPerMonth) * attendanceDays)
  }

  /**
   * Get monthly salary from salary template
   */
  private calculateMonthlySalary(salaryTemplate: any): number {
    if (!salaryTemplate || !salaryTemplate.components) {
      return 0
    }

    try {
      const components = salaryTemplate.components as any[]
      let monthlySalary = 0

      for (const component of components) {
        if (
          component.type === 'earning' &&
          component.isActive !== false &&
          component.calculationType === 'fixed-amount' &&
          typeof component.value === 'number'
        ) {
          monthlySalary += component.value
        }
      }

      return monthlySalary
    } catch (error) {
      return 0
    }
  }

  /**
   * Determine match status based on differences
   */
  private determineMatchStatus(
    daysDifference: number,
    amountDifference: number,
  ): 'Matched' | 'Mismatch' | 'Under Review' {
    if (daysDifference === 0 && amountDifference === 0) {
      return 'Matched'
    } else if (Math.abs(daysDifference) <= 1 && Math.abs(amountDifference) <= 1000) {
      return 'Under Review' // Small differences need review
    } else {
      return 'Mismatch'
    }
  }

  async findAll(status?: string, month?: string, search?: string) {
    // Default to current month if not provided
    const targetMonth = month || new Date().toISOString().slice(0, 7) // YYYY-MM format

    // Get all active employees
    const employees = await this.prisma.employeeMaster.findMany({
      where: {
        status: 'ACTIVE',
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { employeeCode: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        department: true,
        salaryTemplate: true,
      },
    })

    // Process each employee to calculate match records
    const matchRecords = await Promise.all(
      employees.map(async (emp) => {
        const attendanceDays = await this.calculateAttendanceDays(emp.id, targetMonth)
        const payrollDays = await this.calculatePayrollDays(emp.id, targetMonth)
        const daysDifference = attendanceDays - payrollDays

        const monthlySalary = this.calculateMonthlySalary(emp.salaryTemplate)
        const workingDaysPerMonth = 26 // Standard working days, adjust as needed
        const attendanceAmount = this.calculateAttendanceAmount(
          attendanceDays,
          monthlySalary,
          workingDaysPerMonth,
        )
        const payrollAmount = this.calculateAttendanceAmount(
          payrollDays,
          monthlySalary,
          workingDaysPerMonth,
        )
        const amountDifference = attendanceAmount - payrollAmount

        const matchStatus = this.determineMatchStatus(daysDifference, amountDifference)

        return {
          id: `${emp.id}-${targetMonth}`,
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeCode: emp.employeeCode,
          department: emp.department?.departmentName || 'N/A',
          payrollMonth: targetMonth,
          attendanceDays: Math.round(attendanceDays * 10) / 10, // Round to 1 decimal
          payrollDays: Math.round(payrollDays * 10) / 10,
          difference: Math.round(daysDifference * 10) / 10,
          matchStatus,
          attendanceAmount: Math.round(attendanceAmount),
          payrollAmount: Math.round(payrollAmount),
          amountDifference: Math.round(amountDifference),
          remarks:
            daysDifference !== 0 || amountDifference !== 0
              ? `Days difference: ${daysDifference}, Amount difference: ₹${Math.abs(amountDifference)}`
              : undefined,
        }
      }),
    )

    // Filter by status if provided
    if (status && status !== 'all') {
      return matchRecords.filter((r) => r.matchStatus === status)
    }

    return matchRecords
  }
}

