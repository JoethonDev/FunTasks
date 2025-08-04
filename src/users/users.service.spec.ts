import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UserResponseDTO } from './dto/create-user.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventStatus } from 'src/events/entities/event.entity';

// Mock data
const currentDate = new Date().toISOString();

const mockUserEntity = {
  user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  username: 'johndoe',
  name: 'John Doe',
  events: [],
  toResponseDto: () => ({
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    username: 'johndoe',
    name: 'John Doe',
    events: [],
  }),
};

const mockEventEntity = {
  event_id: '123e4567-e89b-12d3-a456-426614174000',
  event_name: 'Test Event',
  execute_at: new Date(),
  status: EventStatus.PENDING,
  executed_at: null,
  user: mockUserEntity,
  toResponseDto: () => ({
    event_id: '123e4567-e89b-12d3-a456-426614174000',
    event_name: 'Test Event',
    execute_at: currentDate,
    status: EventStatus.PENDING,
    executed_at: null,
    user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  }),
};

const mockUserWithEvents = {
  ...mockUserEntity,
  events: [mockEventEntity],
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Repository<User>;

  // A mock repository with the methods we'll use
  const mockUserRepo = {
    create: jest.fn().mockReturnValue(mockUserEntity),
    save: jest.fn().mockResolvedValue(mockUserEntity),
    findOne: jest.fn().mockResolvedValue(mockUserEntity),
    remove: jest.fn().mockResolvedValue(mockUserEntity),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new user DTO', async () => {
      const createUserDto: CreateUserDto = {
        username: 'johndoe',
        name: 'John Doe',
      };
      // Mock the save method to return a user with the toResponseDto method
      jest.spyOn(userRepo, 'save').mockResolvedValue(mockUserEntity);

      const result = await service.create(createUserDto);

      expect(userRepo.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepo.save).toHaveBeenCalledWith(mockUserEntity);
      expect(result).toEqual(mockUserEntity.toResponseDto());
    });
  });

  describe('findUserEvents', () => {
    it('should return an array of events for a valid user', async () => {
      jest
        .spyOn(userRepo, 'findOne')
        .mockResolvedValue(mockUserWithEvents);

      const result = await service.findUserEvents(mockUserWithEvents.user_id);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUserWithEvents.user_id },
        relations: ['events'],
      });
      expect(result).toEqual([mockEventEntity.toResponseDto()]);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findUserEvents('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user has no events', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUserEntity as any);

      await expect(
        service.findUserEvents(mockUserEntity.user_id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserWithEvents', () => {
    it('should return a user DTO with events', async () => {
      jest
        .spyOn(userRepo, 'findOne')
        .mockResolvedValue(mockUserWithEvents as any);

      const result = await service.findUser(
        mockUserWithEvents.user_id,
      );

      const expectedDto: UserResponseDTO = {
        user_id: mockUserWithEvents.user_id,
        username: mockUserWithEvents.username,
        name: mockUserWithEvents.name,
        events: [mockEventEntity.toResponseDto()],
      };

      expect(result).toEqual(expectedDto);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.findUser('non-existent-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUser', () => {
    it('should return a user DTO', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUserEntity as any);

      const result = await service.findUser(mockUserEntity.user_id);
      result
      expect(result).toEqual(mockUserEntity.toResponseDto());
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findUser('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update and return the user DTO', async () => {
      const updateUserDto: UpdateUserDto = {
        user_id: mockUserEntity.user_id,
        name: 'Jane Doe',
      };

      const updatedUser = {
        ...mockUserEntity,
        name: 'Jane Doe',
        toResponseDto: () => ({
          user_id: mockUserEntity.user_id,
          username: mockUserEntity.username,
          name: 'Jane Doe',
        }),
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUserEntity as any);
      jest.spyOn(userRepo, 'save').mockResolvedValue(updatedUser as any);

      const result = await service.updateUser(
        updateUserDto.user_id,
        updateUserDto,
      );

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: updateUserDto.user_id },
      });
      expect(userRepo.merge).toHaveBeenCalledWith(
        mockUserEntity,
        updateUserDto,
      );
      expect(userRepo.save).toHaveBeenCalledWith(mockUserEntity);
      expect(result).toEqual(updatedUser.toResponseDto());
    });

    it('should throw NotFoundException if user is not found', async () => {
      const updateUserDto: UpdateUserDto = {
        user_id: 'non-existent-uuid',
        name: 'Jane Doe',
      };
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateUser(updateUserDto.user_id, updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete and return the deleted user DTO', async () => {
      jest
        .spyOn(userRepo, 'findOne')
        .mockResolvedValue(mockUserWithEvents as any);

      const result = await service.deleteUser(mockUserWithEvents.user_id);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUserWithEvents.user_id },
        relations: ['events'],
      });
      expect(userRepo.remove).toHaveBeenCalledWith(mockUserWithEvents);
      expect(result).toEqual(mockUserWithEvents.toResponseDto());
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(service.deleteUser('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
