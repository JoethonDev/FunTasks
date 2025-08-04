import { Event } from 'src/events/entities/event.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDTO } from '../dto/create-user.dto';

/**
 * Database entity for a user.
 */
@Entity('users')
export class User {
  @ApiProperty({ description: 'The unique ID of the user.' })
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @ApiProperty({ description: 'The unique username of the user.' })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  username: string;

  @ApiProperty({ description: 'The full name of the user.' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => Event, (event) => event.user, { eager: true })
  events: Event[];

  toResponseDto(): UserResponseDTO {
    const dto = new UserResponseDTO();
    dto.user_id = this.user_id;
    dto.username = this.username;
    dto.name = this.name;
    // Events are mapped separately in the service where needed
    return dto;
  }
}
