import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsFutureDate } from '../../common/validators/is-future-date.decorator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new event.
 */
export class CreateEventDto {
  
  /**
   * The user ID associated with the event.
   * @example 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
   */
  @ApiProperty({
    description: 'The UUID of the user scheduling the event.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  /**
   * The name of the event.
   * @example 'Send Reminder Email'
   */
  @ApiProperty({
    description: 'A descriptive name for the event.',
    example: 'Send Reminder Email',
  })
  @IsNotEmpty()
  @IsString()
  event_name: string;

  /**
   * The timestamp when the event should be executed.
   * @example '2025-08-02T10:00:00.000Z'
   */
  @ApiProperty({
    description:
      'The exact future time this event should be executed (ISO 8601 Datetime String).',
    example: '2025-08-02T10:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString({}, { message: 'executeAt must be ISO 8601' })
  @IsFutureDate()
  execute_at: string;
}
