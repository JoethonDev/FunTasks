import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UserResponseDTO } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EventResponseDto } from 'src/events/dto/event-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Service for managing users.
 */
@Injectable()
export class UsersService {
  /**
   * Constructs the UsersService and injects the User repository.
   * @param userRepo Repository for managing User entities.
   */
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  /**
   * Creates a new user.
   * @param createUserDto The DTO for the new user.
   * @returns A promise that resolves to the created `User` entity.
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDTO> {
    const user = this.userRepo.create(createUserDto);
    const savedUser = await this.userRepo.save(user);
    return savedUser.toResponseDto();
  }

  /**
   * Finds all events for a specific user.
   * @param user_id The UUID of the user.
   * @returns A promise that resolves to an array of `EventResponseDto`.
   * @throws NotFoundException if the user or their events are not found.
   */
  async findUserEvents(user_id: string): Promise<EventResponseDto[]> {
    const user = await this.userRepo.findOne({
      where: { user_id: user_id },
      relations: ['events'],
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (!user.events || user.events.length === 0) {
      throw new NotFoundException('User has no scheduled events');
    }

    return user.events.map((event) => event.toResponseDto());
  }

  /**
   * Finds a user by their user ID.
   * @param user_id The UUID of the user to find.
   * @returns A promise that resolves to the `UserResponseDTO` of the found user.
   * @throws NotFoundException if the user is not found.
   */
  async findUser(user_id: string): Promise<UserResponseDTO> {
    const user = await this.userRepo.findOne({
      where: { user_id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const userDto = user.toResponseDto();
    userDto.events = user.events?.map((event) => event.toResponseDto());
    return userDto;
  }

  /**
   * Delete user by user_id if found
   * @param user_id The UUID of the user
   * @returns A promise that resolves to `UserResponseDTO`
   * @throws NotFoundException if the user is not found.
   */
  async deleteUser(user_id: string): Promise<UserResponseDTO> {
    const user = await this.userRepo.findOne({
      where: { user_id: user_id },
      relations: ['events'],
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    await this.userRepo.remove(user);

    return user.toResponseDto();
  }

  /**
   * Updates an existing user's data.
   * @param user_id The UUID of the user to update.
   * @param updateUserDto The DTO containing the updated user information.
   * @returns A promise that resolves to the updated `UserResponseDTO`.
   * @throws NotFoundException if the user is not found.
   */
  async updateUser(
    user_id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDTO> {
    const user = await this.userRepo.findOne({
      where: { user_id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    // Merge the DTO changes into the existing entity
    this.userRepo.merge(user, updateUserDto);

    // Save the updated entity and convert to DTO before returning
    const updatedUser = await this.userRepo.save(user);
    return updatedUser.toResponseDto();
  }
}
