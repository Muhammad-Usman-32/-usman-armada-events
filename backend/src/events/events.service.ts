import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        date: new Date(dto.date),
        location: dto.location,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      ...event,
      goingCount: 0,
      myRsvpStatus: null,
    };
  }

  async findAll(userId: string, filter: 'upcoming' | 'past' | 'all' = 'upcoming') {
    const now = new Date();
    let whereClause = {};
    let orderByClause: { date: 'asc' | 'desc' } = { date: 'asc' };

    if (filter === 'upcoming') {
      whereClause = { date: { gte: now } };
      orderByClause = { date: 'asc' };
    } else if (filter === 'past') {
      whereClause = { date: { lt: now } };
      orderByClause = { date: 'desc' };
    } else {
      orderByClause = { date: 'asc' };
    }

    const events = await this.prisma.event.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            rsvps: {
              where: { status: 'going' },
            },
          },
        },
        rsvps: {
          where: { userId },
          select: { status: true },
        },
      },
    });

    return events.map((event) => {
      const myRsvpStatus = event.rsvps.length > 0 ? event.rsvps[0].status : null;
      const { rsvps, _count, ...rest } = event;
      return {
        ...rest,
        goingCount: _count.rsvps,
        myRsvpStatus,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            rsvps: {
              where: { status: 'going' },
            },
          },
        },
        rsvps: {
          where: { status: 'going' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    // Determine current user's RSVP status (even if cancelled)
    const userRsvp = await this.prisma.rsvp.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
      select: { status: true },
    });

    const attendees = event.rsvps.map((r) => r.user);
    const { rsvps, _count, ...rest } = event;

    return {
      ...rest,
      goingCount: _count.rsvps,
      myRsvpStatus: userRsvp?.status || null,
      attendees,
    };
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    if (existing.createdBy !== userId) {
      throw new ForbiddenException('Only the event organizer can update this event');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.location && { location: dto.location }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            rsvps: {
              where: { status: 'going' },
            },
          },
        },
      },
    });

    return {
      ...updated,
      goingCount: updated._count.rsvps,
    };
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    if (existing.createdBy !== userId) {
      throw new ForbiddenException('Only the event organizer can delete this event');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully', id };
  }
}
