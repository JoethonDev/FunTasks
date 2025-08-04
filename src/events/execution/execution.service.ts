import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    constructor (@InjectRepository(Event) private eventRepo : Repository<Event>) {}

    @Cron(CronExpression.EVERY_SECOND, {
      "name" : "Event Execution"
    })
    /**
     * Cron Job Task that runs every second
     * Check pending events whose execute_at is less than or equal current datetime 
    */
    async handleCron() {
        this.logger.debug('Executing event for current time');
        const now = new Date();
        // Get events that are less than now and pending
        const events = await this.eventRepo.find({
          where: {
            status: EventStatus.PENDING,
            execute_at: LessThanOrEqual(now),
          },
        });


        if (events && events.length > 0) {
            // update events to be executed at now ISO 8601
            const eventsID = events.map(event => event.event_id)
            await this.eventRepo.update({ event_id: In(eventsID) }, {status: EventStatus.EXECUTED, executed_at: now});
        }

    }
}
