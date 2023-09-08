import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { User, UserKey } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User, UserKey>
  ) { }
  
  create(createUserDto: User) {
    return this.userModel.create(createUserDto);
  }

  findAll() {
    return this.userModel.scan().exec();
  }

  findOne(id: UserKey) {
    return this.userModel.get(id);
  }

  update(id: UserKey, updateUserDto: User) {
    return this.userModel.update(id, updateUserDto);
  }

  remove(id: UserKey) {
    return this.userModel.delete(id);
  }
}
