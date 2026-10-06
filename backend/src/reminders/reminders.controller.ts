import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async triggerManually() {
    return this.remindersService.checkAndSendReminders();
  }
}
