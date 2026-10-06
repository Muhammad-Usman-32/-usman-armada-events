import { IsIn, IsOptional } from 'class-validator';

export class EventQueryDto {
  @IsOptional()
  @IsIn(['upcoming', 'past', 'all'], {
    message: 'Filter must be either "upcoming", "past", or "all"',
  })
  filter?: 'upcoming' | 'past' | 'all' = 'upcoming';
}
