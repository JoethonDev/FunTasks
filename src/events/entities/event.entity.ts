import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EventResponseDto } from '../dto/event-response.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum for the status of a scheduled event.
 */
export enum EventStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
}

/**
 * Database entity for a scheduled event.
 */
@Entity('events')
export class Event {
  @ApiProperty({ description: 'The unique ID of the event.' })
  @PrimaryGeneratedColumn('uuid')
  event_id: string;

  @ApiProperty({ description: 'The name of the event.' })
  @Column({ type: 'varchar', length: 255 })
  event_name: string;

  @ApiProperty({ description: 'The scheduled execution timestamp.' })
  @Column({ type: 'timestamp' })
  execute_at: Date;

  @ApiProperty({ description: 'The current status of the event.' })
  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PENDING })
  status: EventStatus;

  @ApiProperty({ description: 'The actual execution timestamp, if executed.' })
  @Column({ type: 'timestamp', nullable: true, default: null })
  executed_at: Date | null;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  user: User;

  /**
   * Converts the Event entity to an EventResponseDto.
   * @param userId - The UUID of the user who owns the event.
   * @returns An `EventResponseDto` object.
   */
  public toResponseDto(): EventResponseDto {
    const dto = new EventResponseDto();
    dto.event_id = this.event_id;
    dto.event_name = this.event_name;
    dto.execute_at = this.execute_at.toISOString();
    dto.status = this.status;
    dto.executed_at = this.executed_at?.toISOString() || null;
    dto.user_id = this.user.user_id;
    return dto;
  }
}
