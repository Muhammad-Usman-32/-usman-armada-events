import { Controller, Get, UseGuards } from '@nestjs/common';
import { RsvpsService } from './rsvps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('rsvps')
@UseGuards(JwtAuthGuard)
export class RsvpsController {
  constructor(private readonly rsvpsService: RsvpsService) {}

  @Get('me')
  async getMyRsvps(@CurrentUser() user: User) {
    return this.rsvpsService.findMyRsvps(user.id);
  }
}
