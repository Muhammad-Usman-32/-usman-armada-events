import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RsvpStatus } from '@prisma/client';

@Injectable()
export class RsvpsService {
  constructor(private readonly prisma: PrismaService) {}

  async setGoing(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const rsvp = await this.prisma.rsvp.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      update: {
        status: RsvpStatus.going,
      },
      create: {
        eventId,
        userId,
        status: RsvpStatus.going,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    });

    return {
      message: 'Successfully RSVP\'d as going',
      rsvp,
    };
  }

  async setCancelled(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    const rsvp = await this.prisma.rsvp.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      update: {
        status: RsvpStatus.cancelled,
      },
      create: {
        eventId,
        userId,
        status: RsvpStatus.cancelled,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    });

    return {
      message: 'Successfully cancelled RSVP',
      rsvp,
    };
  }

  async findMyRsvps(userId: string) {
    const rsvps = await this.prisma.rsvp.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        event: {
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
        },
      },
    });

    return rsvps.map((rsvp) => {
      const { _count, ...eventRest } = rsvp.event;
      return {
        id: rsvp.id,
        status: rsvp.status,
        createdAt: rsvp.createdAt,
        updatedAt: rsvp.updatedAt,
        event: {
          ...eventRest,
          goingCount: _count.rsvps,
        },
      };
    });
  }
}
