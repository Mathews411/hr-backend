import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface SalaryComponent {
  name: string
  type: 'earning' | 'deduction' | 'contribution'
  calculationType: string
  value?: number | string
  isActive?: boolean
}

@Injectable()
export class WageComplianceService {
  constructor(private prisma: PrismaService) {}

  private calculateGrossWages(salaryTemplate: any): number {
    if (!salaryTemplate || !salaryTemplate.components) {
      return 0
    }

    try {
      const components = salaryTemplate.components as SalaryComponent[]
      let grossWages = 0

      for (const component of components) {
        if (
          component.type === 'earning' &&
          component.isActive !== false &&
          component.calculationType === 'fixed-amount' &&
          typeof component.value === 'number'
        ) {
          grossWages += component.value
        }
      }

      return grossWages
    } catch (error) {
      return 0
    }
  }

  async findAll(status?: string, state?: string, month?: string, search?: string) {
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
        designation: true,
        salaryTemplate: true,
      },
    })

    // Minimum wage by state and category (simplified - should come from a configuration table)
    const minimumWageMap: Record<string, Record<string, number>> = {
      'Maharashtra': {
        'Skilled': 15000,
        'Semi-Skilled': 13000,
        'Unskilled': 12000,
      },
      'Karnataka': {
        'Skilled': 14000,
        'Semi-Skilled': 12000,
        'Unskilled': 11000,
      },
      'Tamil Nadu': {
        'Skilled': 14500,
        'Semi-Skilled': 12500,
        'Unskilled': 11500,
      },
    }

    const records = employees.map((emp) => {
      const actualWagePaid = this.calculateGrossWages(emp.salaryTemplate)
      const empState = emp.state || 'Maharashtra'
      // Determine category based on designation or default to 'Skilled'
      const category = emp.designation?.designationName?.toLowerCase().includes('unskilled')
        ? 'Unskilled'
        : emp.designation?.designationName?.toLowerCase().includes('semi')
        ? 'Semi-Skilled'
        : 'Skilled'
      const applicableMinimumWage = minimumWageMap[empState]?.[category] || 12000
      const difference = actualWagePaid - applicableMinimumWage
      const complianceStatus = difference >= 0 ? 'Compliant' : 'Non-Compliant'

      return {
        id: emp.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeCode,
        department: emp.department?.departmentName || 'N/A',
        designation: emp.designation?.designationName || 'N/A',
        state: empState,
        category,
        wageMonth: month || new Date().toISOString().slice(0, 7),
        applicableMinimumWage,
        actualWagePaid,
        difference,
        complianceStatus,
        remarks: difference >= 0 
          ? 'Wage is above minimum wage requirement' 
          : 'Wage is below minimum wage requirement. Action required.',
      }
    })

    // Filter by status if provided
    if (status && status !== 'all') {
      return records.filter((r) => r.complianceStatus === status)
    }

    // Filter by state if provided
    if (state && state !== 'all') {
      return records.filter((r) => r.state === state)
    }

    return records
  }
}

