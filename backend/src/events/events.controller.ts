import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(user.id, createEventDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User, @Query() query: EventQueryDto) {
    return this.eventsService.findAll(user.id, query.filter);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.eventsService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.id, updateEventDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.eventsService.remove(id, user.id);
  }
}
