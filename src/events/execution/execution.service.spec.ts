import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { TasksService } from './execution.service';
import { Logger } from '@nestjs/common';
import { Event, EventStatus } from '../entities/event.entity';

// Mock TypeORM repository
const mockRepository = () => ({
  find: jest.fn(),
  update: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let eventRepository: Repository<Event>;

  beforeAll(() => {
    // Mock the logger to prevent console output during tests
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Event),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCron', () => {
    it('should execute pending events', async () => {
      const event1 = new Event();
      event1.event_id = 'uuid1';
      const event2 = new Event();
      event2.event_id = 'uuid2';
      const pendingEvents = [event1, event2];

      jest.spyOn(eventRepository, 'find').mockResolvedValue(pendingEvents);
      jest.spyOn(eventRepository, 'update').mockResolvedValue(null);

      await service.handleCron();

      expect(eventRepository.find).toHaveBeenCalledWith({
        where: {
          status: EventStatus.PENDING,
          execute_at: LessThanOrEqual(expect.any(Date)),
        },
      });

      const eventIds = pendingEvents.map((e) => e.event_id);
      expect(eventRepository.update).toHaveBeenCalledWith(
        { event_id: In(eventIds) },
        { status: EventStatus.EXECUTED, executed_at: expect.any(Date) },
      );
    });

    it('should do nothing if no pending events', async () => {
      jest.spyOn(eventRepository, 'find').mockResolvedValue([]);
      await service.handleCron();
      expect(eventRepository.update).not.toHaveBeenCalled();
    });
  });
});
