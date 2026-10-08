import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class EventQueryDto {
  @IsOptional()
  @IsIn(['all', 'upcoming', 'past'], {
    message: 'Filter must be either "all", "upcoming", or "past"',
  })
  filter?: 'all' | 'upcoming' | 'past' = 'all';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  mine?: boolean;
}
