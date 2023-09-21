import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardModule } from './board/board.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { ListModule } from './column/list.module';
import { DynamooseModule } from 'nestjs-dynamoose';

@Module({
  imports: [
    DynamooseModule.forRoot({
      // AWS_ACCESS_KEY_ID: 'DUMMYIDEXAMPLE'
      // AWS_SECRET_ACCESS_KEY: 'DUMMYEXAMPLEKEY'
      aws: {
        region: 'us-east-1',
        accessKeyId: 'DUMMYIDEXAMPLE',
        secretAccessKey: 'DUMMYEXAMPLEKEY',
      },
      local: 'http://localhost:8000',
      logger: true,
    }),
    BoardModule,
    TaskModule,
    UserModule,
    ListModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
