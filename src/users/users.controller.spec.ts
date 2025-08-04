import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventResponseDto } from 'src/events/dto/event-response.dto';
import { EventStatus } from 'src/events/entities/event.entity';

// Mock data
const mockUserResponse: UserResponseDTO = {
  user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  username: 'johndoe',
  name: 'John Doe',
};

const mockEventResponse: EventResponseDto = {
  event_id: '123e4567-e89b-12d3-a456-426614174000',
  event_name: 'Test Event',
  execute_at: new Date().toISOString(),
  status: EventStatus.PENDING,
  executed_at: null,
  user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
};

const user_id: string = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

const mockUpdateUserDto: UpdateUserDto = {
  user_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  name: 'Jane Doe',
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // A mock service with the methods we'll use
  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUserResponse),
    findUser: jest.fn().mockResolvedValue({
      ...mockUserResponse,
      events: [mockEventResponse],
    }),
    findUserEvents: jest.fn().mockResolvedValue([mockEventResponse]),
    updateUser: jest.fn().mockResolvedValue(mockUserResponse),
    deleteUser: jest.fn().mockResolvedValue(mockUserResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the service create method with the correct DTO and return a user response', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        name: 'New User',
      };

      await expect(controller.create(createUserDto)).resolves.toEqual(
        mockUserResponse,
      );
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findUser', () => {
    it('should call the service findUser method and return the user with events', async () => {
      await expect(controller.findUser(user_id)).resolves.toEqual({
        ...mockUserResponse,
        events: [mockEventResponse],
      });
      expect(service.findUser).toHaveBeenCalledWith(
        user_id,
      );
    });
  });

  describe('findUserEvents', () => {
    it('should call the service findUserEvents method and return a list of events', async () => {
      await expect(
        controller.findUserEvents(user_id),
      ).resolves.toEqual([mockEventResponse]);
      expect(service.findUserEvents).toHaveBeenCalledWith(
        user_id,
      );
    });
  });

  describe('updateUser', () => {
    it('should call the service updateUser method and return the updated user response', async () => {
      await expect(
        controller.updateUser(user_id, mockUpdateUserDto),
      ).resolves.toEqual(mockUserResponse);
      expect(service.updateUser).toHaveBeenCalledWith(
        user_id,
        mockUpdateUserDto,
      );
    });
  });

  describe('deleteUser', () => {
    it('should call the service deleteUser method and return the deleted user response', async () => {
      await expect(controller.deleteUser(user_id)).resolves.toEqual(
        mockUserResponse,
      );
      expect(service.deleteUser).toHaveBeenCalledWith(
        user_id,
      );
    });
  });
});
