import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from './entities/event.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock data
const mockUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
const mockEventId = '123e4567-e89b-12d3-a456-426614174000';

const mockEventResponse: EventResponseDto = {
  event_id: mockEventId,
  event_name: 'Test Event',
  execute_at: new Date().toISOString(),
  status: EventStatus.PENDING,
  executed_at: null,
  user_id: mockUserId,
};

const mockUpdatedEventResponse: EventResponseDto = {
  ...mockEventResponse,
  event_name: 'Updated Event Name',
};

const mockCreateEventDto: CreateEventDto = {
  user_id: mockUserId,
  event_name: 'New Event',
  execute_at: new Date().toISOString(),
};

const mockUpdateEventDto: UpdateEventDto = {
  event_id: mockEventId,
  event_name: 'Updated Event Name',
};



describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  // A mock service with the methods we'll use
  const mockEventsService = {
    create: jest.fn().mockResolvedValue(mockEventResponse),
    findAllPending: jest.fn().mockResolvedValue([mockEventResponse]),
    findEventsByUser: jest.fn().mockResolvedValue([mockEventResponse]),
    updateEvent: jest.fn().mockResolvedValue(mockUpdatedEventResponse),
    deleteEvent: jest.fn().mockResolvedValue(mockEventResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the service create method and return the created event', async () => {
      await expect(controller.create(mockCreateEventDto)).resolves.toEqual(
        mockEventResponse,
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateEventDto);
    });
  });

  describe('findAllPending', () => {
    it('should call the service findAllPending method and return an array of pending events', async () => {
      await expect(controller.findAllPending()).resolves.toEqual([
        mockEventResponse,
      ]);
      expect(service.findAllPending).toHaveBeenCalled();
    });
  });

  describe('findEventsByUser', () => {
    it('should call the service findEventsByUser method and return an array of events', async () => {
      await expect(controller.findEventsByUser(mockUserId)).resolves.toEqual([
        mockEventResponse,
      ]);
      expect(service.findEventsByUser).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('updateEvent', () => {
    it('should call the service updateEvent method and return the updated event', async () => {
      await expect(
        controller.updateEvent(mockEventId, mockUpdateEventDto),
      ).resolves.toEqual(mockUpdatedEventResponse);
      expect(service.updateEvent).toHaveBeenCalledWith(mockUpdateEventDto);
    });
  });

  describe('deleteEvent', () => {
    it('should call the service deleteEvent method and return the deleted event', async () => {
      await expect(
        controller.deleteEvent(mockEventId),
      ).resolves.toEqual(mockEventResponse);
      expect(service.deleteEvent).toHaveBeenCalledWith(
        mockEventId,
      );
    });
  });
});
