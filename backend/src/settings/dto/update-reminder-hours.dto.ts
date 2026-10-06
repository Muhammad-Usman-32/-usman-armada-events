import { IsInt, Min } from 'class-validator';

export class UpdateReminderHoursDto {
  @IsInt({ message: 'Reminder hours must be an integer' })
  @Min(1, { message: 'Reminder hours must be at least 1' })
  hours: number;
}
