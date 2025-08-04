import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
// import { ExecutionService } from './execution/execution.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { TasksService } from './execution/execution.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User])],
  controllers: [EventsController],
  providers: [EventsService, TasksService],
})
export class EventsModule {}
