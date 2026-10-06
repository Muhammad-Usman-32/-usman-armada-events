import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getReminderHours(): Promise<number> {
    const setting = await this.prisma.setting.findUnique({
      where: { key: 'reminder_hours' },
    });

    if (setting && setting.value) {
      const parsed = parseInt(setting.value, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    const defaultHours = this.configService.get<number>('DEFAULT_REMINDER_HOURS', 24);
    return Number(defaultHours);
  }

  async updateReminderHours(hours: number): Promise<number> {
    const setting = await this.prisma.setting.upsert({
      where: { key: 'reminder_hours' },
      update: { value: hours.toString() },
      create: { key: 'reminder_hours', value: hours.toString() },
    });

    return parseInt(setting.value, 10);
  }
}
