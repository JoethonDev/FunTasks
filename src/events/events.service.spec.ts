import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsService } from './events.service';
import { Event, EventStatus } from './entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock data
const mockUserEntity = {
  user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  username: 'testuser',
  name: 'Test User',
  events: [],
  toResponseDto: jest.fn(() => ({
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    username: 'testuser',
    name: 'Test User',
  })),
};

const mockEventEntityPending = {
  event_id: '123e4567-e89b-12d3-a456-426614174000',
  event_name: 'Pending Event',
  execute_at: new Date('2025-08-02T10:00:00.000Z'),
  status: EventStatus.PENDING,
  executed_at: null,
  user: mockUserEntity,
  toResponseDto: jest.fn(() => ({
    event_id: '123e4567-e89b-12d3-a456-426614174000',
    event_name: 'Pending Event',
    execute_at: '2025-08-02T10:00:00.000Z',
    status: EventStatus.PENDING,
    executed_at: null,
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })),
};

const mockEventEntityExecuted = {
  event_id: '890e1234-e5f6-7890-1234-567890abcdefgh',
  event_name: 'Executed Event',
  execute_at: new Date('2025-08-01T10:00:00.000Z'),
  status: EventStatus.EXECUTED,
  executed_at: new Date('2025-08-01T10:00:00.000Z'),
  user: mockUserEntity,
  toResponseDto: jest.fn(() => ({
    event_id: '890e1234-e5f6-7890-1234-567890abcdefgh',
    event_name: 'Executed Event',
    execute_at: '2025-08-01T10:00:00.000Z',
    status: EventStatus.EXECUTED,
    executed_at: '2025-08-01T10:00:00.000Z',
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })),
};

const mockUserWithEvents = {
  ...mockUserEntity,
  events: [mockEventEntityPending, mockEventEntityExecuted],
};


describe('EventsService', () => {
  let service: EventsService;
  let eventRepo: Repository<Event>;
  let userRepo: Repository<User>;

  const mockEventRepo = {
    create: jest.fn().mockReturnValue(mockEventEntityPending),
    save: jest.fn().mockResolvedValue(mockEventEntityPending),
    findOne: jest.fn().mockResolvedValue(mockEventEntityPending),
    find: jest.fn().mockResolvedValue([mockEventEntityPending]),
    remove: jest.fn().mockResolvedValue(mockEventEntityPending),
    merge: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn().mockResolvedValue(mockUserEntity),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventRepo = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEventDto: CreateEventDto = {
      user_id: mockUserEntity.user_id,
      event_name: 'New Test Event',
      execute_at: '2025-08-02T10:00:00.000Z',
    };

    it('should successfully create an event if the user exists', async () => {
      // Ensure the mock returns the user and saves the event correctly
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUserEntity);
      jest.spyOn(eventRepo, 'save').mockResolvedValue(mockEventEntityPending);

      const result = await service.create(createEventDto);

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { user_id: createEventDto.user_id } });
      expect(eventRepo.create).toHaveBeenCalledWith({
        event_name: createEventDto.event_name,
        execute_at: new Date(createEventDto.execute_at),
        user: mockUserEntity,
      });
      expect(eventRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEventEntityPending.toResponseDto());
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
      await expect(service.create(createEventDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllPending', () => {
    it('should return an array of pending events', async () => {
      jest.spyOn(eventRepo, 'find').mockResolvedValue([mockEventEntityPending]);
      const result = await service.findAllPending();
      expect(eventRepo.find).toHaveBeenCalledWith({
        where: { status: EventStatus.PENDING },
        relations: ['user'],
      });
      expect(result).toEqual([mockEventEntityPending.toResponseDto()]);
    });
  });

  describe('findEventsByUser', () => {
    it('should return an array of events for a user', async () => {
      jest.spyOn(eventRepo, 'find').mockResolvedValue([mockEventEntityPending, mockEventEntityExecuted] as Event[]);
      const result = await service.findEventsByUser(mockUserEntity.user_id);
      expect(eventRepo.find).toHaveBeenCalledWith({
        where: { user: { user_id: mockUserEntity.user_id } },
        relations: ['user'],
      });
      expect(result.length).toBe(2);
      expect(result).toEqual([
        mockEventEntityPending.toResponseDto(),
        mockEventEntityExecuted.toResponseDto(),
      ]);
    });

    it('should throw NotFoundException if the user has no events', async () => {
      jest.spyOn(eventRepo, 'find').mockResolvedValue([]);
      await expect(service.findEventsByUser('user-with-no-events')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete a pending event', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(mockEventEntityPending);
      const result = await service.deleteEvent(mockEventEntityPending.event_id);
      expect(eventRepo.findOne).toHaveBeenCalledWith({
        where: { event_id: mockEventEntityPending.event_id },
        relations: ['user'],
      });
      expect(eventRepo.remove).toHaveBeenCalledWith(mockEventEntityPending);
      expect(result).toEqual(mockEventEntityPending.toResponseDto());
    });

    it('should throw NotFoundException if the event is not found', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(null);
      await expect(service.deleteEvent('non-existent-event')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if the event is not pending', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(mockEventEntityExecuted);
      await expect(service.deleteEvent(mockEventEntityExecuted.event_id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateEvent', () => {
    it('should update a pending event', async () => {
      const updateDto: UpdateEventDto = {
        event_id: mockEventEntityPending.event_id,
        event_name: 'Updated Event Name',
      };
      
      const updatedEventEntity: Event = {
        ...mockEventEntityPending,
        event_name: updateDto.event_name as string,
        toResponseDto: jest.fn(() => ({
            ...mockEventEntityPending.toResponseDto(),
            event_name: updateDto.event_name as string,
        })),
      };

      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(mockEventEntityPending);
      jest.spyOn(eventRepo, 'save').mockResolvedValue(updatedEventEntity);

      const result = await service.updateEvent(updateDto);

      expect(eventRepo.findOne).toHaveBeenCalledWith({
        where: { event_id: updateDto.event_id },
        relations: ['user'],
      });
      expect(eventRepo.merge).toHaveBeenCalledWith(mockEventEntityPending, updateDto);
      expect(eventRepo.save).toHaveBeenCalled();
      expect(result.event_name).toBe(updateDto.event_name);
    });

    it('should throw NotFoundException if the event is not found', async () => {
      const updateDto: UpdateEventDto = {
        event_id: 'non-existent-event',
        event_name: 'Updated Event Name',
      };
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(null);
      await expect(service.updateEvent(updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if the event is not pending', async () => {
      const updateDto: UpdateEventDto = {
        event_id: mockEventEntityExecuted.event_id,
        event_name: 'Updated Event Name',
      };
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(mockEventEntityExecuted);
      await expect(service.updateEvent(updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
