import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class RemindersService implements OnModuleInit {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const cronPattern = this.configService.get<string>('REMINDER_CRON', '0 * * * *');
    try {
      const job = new CronJob(cronPattern, async () => {
        await this.checkAndSendReminders();
      });

      this.schedulerRegistry.addCronJob('event-reminder-cron', job);
      job.start();
      this.logger.log(`Initialized reminder cron job with pattern: "${cronPattern}"`);
    } catch (err) {
      this.logger.error(`Failed to initialize cron job with pattern "${cronPattern}": ${err.message}`);
    }
  }

  async checkAndSendReminders() {
    this.logger.log('Executing event reminders check...');

    const reminderHours = await this.settingsService.getReminderHours();
    const now = new Date();
    const windowEnd = new Date(now.getTime() + reminderHours * 60 * 60 * 1000);

    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        date: {
          gte: now,
          lte: windowEnd,
        },
      },
      include: {
        rsvps: {
          where: {
            status: 'going',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    let reminderCount = 0;

    for (const event of upcomingEvents) {
      for (const rsvp of event.rsvps) {
        reminderCount++;
        const reminderLine = `[REMINDER] Event "${event.title}" is happening at ${event.date.toISOString()} in ${event.location}. User ${rsvp.user.name} (${rsvp.user.email}) is attending!`;
        console.log(reminderLine);
      }
    }

    this.logger.log(
      `Reminders check completed. Events in next ${reminderHours}h: ${upcomingEvents.length}, Reminders logged: ${reminderCount}`,
    );

    return {
      reminderHours,
      eventsChecked: upcomingEvents.length,
      remindersLogged: reminderCount,
    };
  }
}
