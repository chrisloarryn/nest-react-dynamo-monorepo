import { Module } from '@nestjs/common';
import { ListService } from './list.service';
import { ListController } from './list.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ListSchema } from './entities/list.entity';

@Module({
  imports: [
    DynamooseModule.forFeature([{
      name: 'List',
      schema: ListSchema,
      options: {
        tableName: 'lists',
      }
  }]),
  ],
  providers: [ListService],
  controllers: [ListController],
})
export class ListModule {}
