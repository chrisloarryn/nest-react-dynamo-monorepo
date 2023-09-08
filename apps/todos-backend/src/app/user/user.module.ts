import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DynamooseModule } from 'nestjs-dynamoose';
import { UserSchema } from './entities/user.entity';

@Module({
  imports: [
    DynamooseModule.forFeature([{
      name: 'User',
      schema: UserSchema,
      options: {
        tableName: 'tasks',
        update: true,
        tags: {
          displayName: 'string',
          email: 'string',
          avatarUrl: 'string',
        },
        
      }
  }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
