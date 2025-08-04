import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UpdateEventDto } from './dto/update-event.dto';

/**
 * Controller for handling event-related API endpoints.
 */
@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Schedules a new event.
   * @param createEventDto The DTO for the new event.
   * @returns A promise that resolves to the created `EventResponseDto`.
   */
  @Post('/schedule')
  @ApiOperation({ summary: 'Schedule a new event for a user' })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully scheduled.',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User Not Found: If user_id does not exist.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid Request: Missing parameters or invalid data.',
  })
  async create(
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.create(createEventDto);
  }

  /**
   * Retrieves all events that are in a pending status.
   * @returns A promise that resolves to an array of `EventResponseDto`.
   */
  @Get('/pending')
  @ApiOperation({ summary: 'Get all pending events' })
  @ApiResponse({
    status: 200,
    description: 'A list of all scheduled events with pending status.',
    type: [EventResponseDto],
  })
  async findAllPending(): Promise<EventResponseDto[]> {
    return this.eventsService.findAllPending();
  }

  /**
   * Retrieves all events for a specific user.
   * @param params DTO containing the user's UUID.
   * @returns A promise that resolves to an array of `EventResponseDto`.
   */
  @Get('/user/:user_id')
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
    description: 'User has no scheduled events.',
  })
  async findEventsByUser(
    @Param('user_id') user_id: string,
  ): Promise<EventResponseDto[]> {
    return this.eventsService.findEventsByUser(user_id);
  }

  /**
   * Updates a pending event by its ID.
   * @param params DTO containing the event's UUID.
   * @param updateEventDto The DTO with the updated event details.
   * @returns A promise that resolves to the updated `EventResponseDto`.
   */
  @Patch(':event_id')
  @ApiOperation({ summary: 'Update a pending event' })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully updated.',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Only pending events can be updated.',
  })
  async updateEvent(
    @Param('event_id', ParseUUIDPipe) event_id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    // The event_id from the URL param and the DTO should match for consistency,
    // but the service method will primarily use the DTO's ID.
    // For now, let's ensure the DTO's event_id is used.
    updateEventDto.event_id = event_id;
    return this.eventsService.updateEvent(updateEventDto);
  }

  /**
   * Deletes a pending event by its ID.
   * @param params DTO containing the event's UUID.
   * @returns A promise that resolves to the deleted `EventResponseDto`.
   */
  @Delete(':event_id')
  @ApiOperation({ summary: 'Delete a pending event' })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully deleted.',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Only pending events can be deleted.',
  })
  async deleteEvent(
    @Param('event_id', ParseUUIDPipe) event_id: string,
  ): Promise<EventResponseDto> {
    return this.eventsService.deleteEvent(event_id);
  }
}
