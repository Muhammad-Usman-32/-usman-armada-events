import { Module } from '@nestjs/common';
import { RsvpsController } from './rsvps.controller';
import { EventRsvpsController } from './event-rsvps.controller';
import { RsvpsService } from './rsvps.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RsvpsController, EventRsvpsController],
  providers: [RsvpsService],
  exports: [RsvpsService],
})
export class RsvpsModule {}
