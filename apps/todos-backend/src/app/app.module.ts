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
      aws: {
        region: process.env.AWS_REGION ?? 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'DUMMYIDEXAMPLE',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'DUMMYEXAMPLEKEY',
      },
      local: process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000',
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
