import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskSchema } from './entities/task.entity';
import { DynamooseModule } from 'nestjs-dynamoose';

@Module({
  imports: [
    DynamooseModule.forFeature([{
      name: 'Task',
      schema: TaskSchema,
      options: {
        tableName: 'tasks',
      }
  }]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
