import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { EventResponseDto } from './dto/event-response.dto';
import { UpdateEventDto } from './dto/update-event.dto';

/**
 * Service for managing events.
 */
@Injectable()
export class EventsService {
  /**
   * Constructs the EventsService and injects the Event and User repositories.
   * @param eventRepo Repository for managing Event entities.
   * @param userRepo Repository for managing User entities.
   */
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  /**
   * Creates a new event for a user.
   * @param createEventDto The DTO containing event details.
   * @returns A promise that resolves to the created `EventResponseDto`.
   * @throws NotFoundException if the specified user does not exist.
   */
  async create(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    const user = await this.userRepo.findOne({
      where: { user_id: createEventDto.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const event = this.eventRepo.create({
      event_name: createEventDto.event_name,
      execute_at: new Date(createEventDto.execute_at),
      user: user,
    });

    const eventRecord = await this.eventRepo.save(event);
    return eventRecord.toResponseDto();
  }

  /**
   * Retrieves all pending events.
   * @returns A promise that resolves to an array of `EventResponseDto` for all pending events.
   */
  async findAllPending(): Promise<EventResponseDto[]> {
    const pendingEvents = await this.eventRepo.find({
      where: { status: EventStatus.PENDING },
      relations: ['user'],
    });
    return pendingEvents.map((event) => event.toResponseDto());
  }

  /**
   * Finds all events for a specific user.
   * @param user_id The UUID of the user.
   * @returns A promise that resolves to an array of `EventResponseDto`.
   * @throws NotFoundException if the user has no events.
   */
  async findEventsByUser(user_id: string): Promise<EventResponseDto[]> {
    const events = await this.eventRepo.find({
      where: { user: { user_id } },
      relations: ['user'],
    });

    if (!events || events.length === 0) {
      throw new NotFoundException('User has no scheduled events');
    }

    return events.map((event) => event.toResponseDto());
  }

  /**
   * Deletes an event by ID. Deletion is only allowed for pending events.
   * @param event_id The UUID of the event to delete.
   * @returns A promise that resolves to the deleted `EventResponseDto`.
   * @throws NotFoundException if the event is not found.
   * @throws BadRequestException if the event is not in a pending status.
   */
  async deleteEvent(event_id: string): Promise<EventResponseDto> {
    const event = await this.eventRepo.findOne({
      where: { event_id },
      relations: ['user'],
    });

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    if (event.status !== EventStatus.PENDING) {
      throw new BadRequestException('Only pending events can be deleted.');
    }

    await this.eventRepo.remove(event);
    return event.toResponseDto();
  }

  /**
   * Updates an existing event. The update is only allowed for pending events.
   * @param updateEventDto The DTO with the event ID and updated details.
   * @returns A promise that resolves to the updated `EventResponseDto`.
   * @throws NotFoundException if the event is not found.
   * @throws BadRequestException if the event is not in a pending status.
   */
  async updateEvent(updateEventDto: UpdateEventDto): Promise<EventResponseDto> {
    const event = await this.eventRepo.findOne({
      where: { event_id: updateEventDto.event_id },
      relations: ['user'],
    });

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    if (event.status !== EventStatus.PENDING) {
      throw new BadRequestException('Only pending events can be updated.');
    }

    // Convert execute_at string to Date object if present
    const updatedFields: any = { ...updateEventDto };
    if (updatedFields.execute_at) {
      updatedFields.execute_at = new Date(updatedFields.execute_at);
    }

    this.eventRepo.merge(event, updatedFields);
    const updatedEvent = await this.eventRepo.save(event);
    return updatedEvent.toResponseDto();
  }
}
