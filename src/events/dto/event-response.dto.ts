import { EventStatus } from '../entities/event.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the event response payload.
 */
export class EventResponseDto {
  /**
   * The unique ID of the event.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  @ApiProperty({
    description: 'The unique ID of the event.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  event_id: string;

  /**
   * The current status of the event.
   * @example 'pending'
   */
  @ApiProperty({
    description: 'The current status of the event.',
    enum: EventStatus,
    example: "pending",
  })
  status: EventStatus;

  /**
   * The timestamp when the event was executed.
   * @example '2025-08-02T10:00:00.000Z'
   */
  @ApiProperty({
    description: 'The timestamp when the event was executed (null if pending).',
    example: null,
  })
  executed_at: string | null;

  /**
   * The name of the event.
   * @example 'Send Reminder Email'
   */
  @ApiProperty({
    description: 'A descriptive name for the event.',
    example: 'Send Reminder Email',
  })
  event_name: string;

  /**
   * The timestamp when the event is scheduled to be executed.
   * @example '2025-08-02T10:00:00.000Z'
   */
  @ApiProperty({
    description: 'The scheduled execution time for the event.',
    example: '2025-08-02T10:00:00.000Z',
  })
  execute_at: string;

  /**
   * The ID of the user who owns this event.
   * @example 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
   */
  @ApiProperty({
    description: 'The ID of the user who owns this event.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  user_id: string;
}
