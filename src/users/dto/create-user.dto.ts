import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { EventResponseDto } from 'src/events/dto/event-response.dto';

/**
 * DTO for creating a new user.
 */
export class CreateUserDto {
  /**
   * The user's unique username. Must be at least 3 characters.
   * @example 'johndoe'
   */
  @ApiProperty({
    description: "The user's unique username.",
    example: 'johndoe',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  /**
   * The user's full name.
   * @example 'John Doe'
   */
  @ApiProperty({
    description: "The user's full name.",
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UserResponseDTO extends CreateUserDto {
  @ApiProperty({
    description: "The user's id.",
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  events?: EventResponseDto[];
}
