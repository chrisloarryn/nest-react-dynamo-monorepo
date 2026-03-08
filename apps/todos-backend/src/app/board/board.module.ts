import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { BoardSchema } from './entities/board.entity';
import { ListSchema } from '../column/entities/list.entity';
import { TaskSchema } from '../task/entities/task.entity';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'Board',
        schema: BoardSchema,
        options: {
          tableName: 'boards',
          create: false,
          waitForActive: false,
        },
      },
      {
        name: 'List',
        schema: ListSchema,
        options: {
          tableName: 'lists',
          create: false,
          waitForActive: false,
        },
      },
      {
        name: 'Task',
        schema: TaskSchema,
        options: {
          tableName: 'tasks',
          create: false,
          waitForActive: false,
        },
      },
    ]),
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
