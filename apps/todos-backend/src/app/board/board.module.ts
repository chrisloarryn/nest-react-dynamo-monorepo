import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { BoardSchema } from './entities/board.entity';

@Module({
  imports: [
    DynamooseModule.forFeature([{
      name: 'Board',
      schema: BoardSchema,
      options: {
        tableName: 'boards',
      }
  }]),
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
