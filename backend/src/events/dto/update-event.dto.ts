import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Date must be a valid ISO date-time string' })
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
