import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateReminderHoursDto } from './dto/update-reminder-hours.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('reminder-hours')
  async getReminderHours() {
    const reminderHours = await this.settingsService.getReminderHours();
    return { reminderHours };
  }

  @Patch('reminder-hours')
  async updateReminderHours(@Body() dto: UpdateReminderHoursDto) {
    const reminderHours = await this.settingsService.updateReminderHours(dto.hours);
    return { reminderHours };
  }
}
