import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateHRTicketDto } from './dto/create-hr-ticket.dto'
import { UpdateHRTicketDto } from './dto/update-hr-ticket.dto'
import { CreateTicketResponseDto } from './dto/create-ticket-response.dto'
// TODO: After running `npx prisma generate`, uncomment the line below
// import { TicketStatus, TicketPriority } from '@prisma/client'

// Temporary enum definitions until Prisma client is regenerated
const TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  ON_HOLD: 'ON_HOLD',
} as const

const TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

@Injectable()
export class HRTicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateHRTicketDto) {
    // Validate that employeeMasterId exists
    // First try to find by UUID (id field)
    let employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    // If not found by UUID, try to find by employee code (in case frontend sends wrong format)
    if (!employee && createDto.employeeMasterId.startsWith('EMP-')) {
      employee = await this.prisma.employeeMaster.findUnique({
        where: { employeeCode: createDto.employeeMasterId },
      })
      
      if (employee) {
        // Use the actual UUID from the database
        createDto.employeeMasterId = employee.id
      }
    }

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createDto.employeeMasterId} not found. Please ensure your employee profile exists in the system.`
      )
    }

    // Generate ticket number
    const count = await this.prisma.hRTicket.count()
    const ticketNumber = `HR-${Date.now()}`

    const ticket = await this.prisma.hRTicket.create({
      data: {
        ticketNumber,
        employeeMasterId: createDto.employeeMasterId,
        ticketType: createDto.ticketType,
        category: createDto.category,
        subject: createDto.subject,
        description: createDto.description,
        priority: createDto.priority || TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        relatedTo: createDto.relatedTo,
      },
      include: {
        employeeMaster: true,
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return this.formatTicketResponse(ticket)
  }

  async findAll(
    employeeMasterId?: string,
    status?: string,
    priority?: string,
    category?: string,
    search?: string,
  ) {
    const where: any = {}

    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (category && category !== 'all') where.category = category

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { ticketType: { contains: search, mode: 'insensitive' } },
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const tickets = await this.prisma.hRTicket.findMany({
      where,
      include: {
        employeeMaster: true,
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdDate: 'desc' },
    })

    return tickets.map(ticket => this.formatTicketResponse(ticket))
  }

  async findOne(id: string) {
    const ticket = await this.prisma.hRTicket.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        responses: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { uploadedDate: 'desc' },
        },
      },
    })

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`)
    }

    return this.formatTicketResponse(ticket)
  }

  async update(id: string, updateDto: UpdateHRTicketDto) {
    const ticket = await this.prisma.hRTicket.findUnique({
      where: { id },
    })

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`)
    }

    const updateData: any = { ...updateDto }
    
    // If status is being updated to RESOLVED or CLOSED, set resolvedDate
    if (updateDto.status === TicketStatus.RESOLVED || updateDto.status === TicketStatus.CLOSED) {
      if (!ticket.resolvedDate) {
        updateData.resolvedDate = new Date()
      }
    }

    const updated = await this.prisma.hRTicket.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return this.formatTicketResponse(updated)
  }

  async addResponse(createDto: CreateTicketResponseDto) {
    const ticket = await this.prisma.hRTicket.findUnique({
      where: { id: createDto.ticketId },
    })

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${createDto.ticketId} not found`)
    }

    const response = await this.prisma.ticketResponse.create({
      data: {
        ticketId: createDto.ticketId,
        respondedBy: createDto.respondedBy,
        response: createDto.response,
        status: createDto.status,
        isInternal: createDto.isInternal || false,
      },
    })

    // Update ticket status if provided
    if (createDto.status) {
      const updateData: any = { status: createDto.status }
      if (createDto.status === TicketStatus.RESOLVED || createDto.status === TicketStatus.CLOSED) {
        if (!ticket.resolvedDate) {
          updateData.resolvedDate = new Date()
        }
        updateData.resolvedBy = createDto.respondedBy
      }

      await this.prisma.hRTicket.update({
        where: { id: createDto.ticketId },
        data: updateData,
      })
    }

    return response
  }

  async getResolutionReports(
    startDate?: string,
    endDate?: string,
    category?: string,
  ) {
    const where: any = {
      status: {
        in: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
      },
    }

    if (startDate || endDate) {
      where.resolvedDate = {}
      if (startDate) where.resolvedDate.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.resolvedDate.lte = end
      }
    }

    if (category && category !== 'all') {
      where.category = category
    }

    const tickets = await this.prisma.hRTicket.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: { resolvedDate: 'desc' },
    })

    return tickets.map(ticket => {
      const createdDate = new Date(ticket.createdDate)
      const resolvedDate = ticket.resolvedDate ? new Date(ticket.resolvedDate) : new Date()
      const resolutionTime = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60) // hours

      return {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        ticketType: ticket.ticketType,
        category: ticket.category,
        subject: ticket.subject,
        priority: ticket.priority,
        status: ticket.status,
        employeeName: ticket.employeeMaster
          ? `${ticket.employeeMaster.firstName} ${ticket.employeeMaster.lastName}`
          : 'Unknown',
        employeeCode: ticket.employeeMaster?.employeeCode || '',
        createdDate: ticket.createdDate.toISOString(),
        resolvedDate: ticket.resolvedDate?.toISOString() || '',
        resolutionTime,
        assignedTo: ticket.assignedTo || '',
        resolvedBy: ticket.resolvedBy || '',
        satisfactionRating: ticket.satisfactionRating,
      }
    })
  }

  private formatTicketResponse(ticket: any) {
    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      ticketType: ticket.ticketType,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      relatedTo: ticket.relatedTo,
      assignedTo: ticket.assignedTo,
      createdDate: ticket.createdDate.toISOString(),
      lastUpdated: ticket.lastUpdated.toISOString(),
      resolvedDate: ticket.resolvedDate?.toISOString(),
      resolvedBy: ticket.resolvedBy,
      satisfactionRating: ticket.satisfactionRating,
      employeeId: ticket.employeeMasterId,
      employeeName: ticket.employeeMaster
        ? `${ticket.employeeMaster.firstName} ${ticket.employeeMaster.lastName}`
        : 'Unknown',
      employeeCode: ticket.employeeMaster?.employeeCode || '',
      responseCount: ticket.responses?.length || 0,
      lastResponseDate: ticket.responses?.[0]?.createdAt.toISOString(),
      needsResponse: ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS,
      responses: ticket.responses?.map((r: any) => ({
        id: r.id,
        response: r.response,
        respondedBy: r.respondedBy,
        status: r.status,
        isInternal: r.isInternal,
        createdAt: r.createdAt.toISOString(),
      })) || [],
      attachments: ticket.attachments?.map((a: any) => ({
        id: a.id,
        fileName: a.fileName,
        fileType: a.fileType,
        fileSize: a.fileSize,
        fileUrl: a.fileUrl,
        uploadedDate: a.uploadedDate.toISOString(),
      })) || [],
    }
  }
}

