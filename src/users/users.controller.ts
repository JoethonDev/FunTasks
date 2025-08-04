import { Controller, Get, Post, Body, Param, Delete, Patch, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDTO } from './dto/create-user.dto';
import { EventResponseDto } from 'src/events/dto/event-response.dto';
import { User } from './entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Controller for handling user-related API endpoints.
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user.
   * @param createUserDto The DTO for the new user.
   * @returns A promise that resolves to the created `User` entity.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDTO> {
    return this.usersService.create(createUserDto);
  }

  /**
   * Retrieves a user by ID, including their scheduled events.
   * @param params DTO containing the user's UUID.
   * @returns A promise that resolves to the `UserResponseDTO` of the found user with their events.
   */
  @Get(':user_id')
  @ApiOperation({ summary: 'Find a user by ID and their scheduled events' })
  @ApiResponse({
    status: 200,
    description: 'User details including events.',
    type: UserResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'User Not Found',
  })
  findUser(
    @Param('user_id', ParseUUIDPipe) user_id: string,
  ): Promise<UserResponseDTO> {
    return this.usersService.findUser(user_id);
  }

  /**
   * Retrieves all scheduled events for a specific user.
   * @param user_id The UUID of the user.
   * @returns A promise that resolves to an array of `EventResponseDto`.
   */
  @Get(':user_id/events')
  @ApiOperation({ summary: 'Get all scheduled events for a specific user' })
  @ApiParam({
    name: 'user_id',
    description: 'The UUID of the user.',
    type: String,
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of scheduled events for the user.',
    type: [EventResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'User Not Found or No Events Found.',
  })
  findUserEvents(
    @Param('user_id', ParseUUIDPipe) user_id: string,
  ): Promise<EventResponseDto[]> {
    return this.usersService.findUserEvents(user_id);
  }

  /**
   * Update user's data
   * @param updateUserDto The DTO for existing user with some updates.
   * @returns A promise that resolves to `userResponse DTO`
   */
  @Patch(':user_id') // Add user_id to the path for identifying the user
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({
    status: 200,
    description: 'Updated user is returned',
    type: UserResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'User Not Found',
  })
  updateUser(
    @Param('user_id', ParseUUIDPipe) user_id: string, // Add @Param for user_id
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDTO> {
    return this.usersService.updateUser(user_id, updateUserDto);
  }

  /**
   * Delete user by user id if found
   * @param user_id
   * @returns A promise that resolves to `userResponse DTO`
   */
  @Delete(':user_id') // Add user_id to the path for identifying the user
  @ApiOperation({ summary: 'Delete user and his scheduled events' })
  @ApiParam({
    name: 'user_id',
    description: 'The UUID of the user.',
    type: String,
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted user is returned',
    type: UserResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'User Not Found',
  })
  deleteUser(
    @Param('user_id', ParseUUIDPipe) user_id: string,
  ): Promise<UserResponseDTO> {
    return this.usersService.deleteUser(user_id);
  }

}
