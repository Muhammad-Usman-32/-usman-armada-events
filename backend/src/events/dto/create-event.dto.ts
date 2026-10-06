import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Date must be a valid ISO date-time string' })
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;
}
