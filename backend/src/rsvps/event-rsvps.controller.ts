import { Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { RsvpsService } from './rsvps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('events/:id/rsvp')
@UseGuards(JwtAuthGuard)
export class EventRsvpsController {
  constructor(private readonly rsvpsService: RsvpsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async setGoing(@Param('id') eventId: string, @CurrentUser() user: User) {
    return this.rsvpsService.setGoing(eventId, user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async setCancelled(@Param('id') eventId: string, @CurrentUser() user: User) {
    return this.rsvpsService.setCancelled(eventId, user.id);
  }
}
