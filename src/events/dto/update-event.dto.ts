import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

/**
 * DTO for updating an existing event.
 * Properties are optional, except for the event_id, and enforce specific validations.
 */
export class UpdateEventDto {
  @ApiProperty({
    description: "The event's ID.",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'event_id must be a valid UUID' })
  event_id: string;

  @ApiProperty({
    description: 'A new descriptive name for the event.',
    example: 'Update Reminder Email',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  event_name?: string;

  @ApiProperty({
    description:
      'A new scheduled execution time for the event (ISO 8601 Datetime String).',
    example: '2025-08-03T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'executeAt must be ISO 8601' })
  execute_at?: string;
}
