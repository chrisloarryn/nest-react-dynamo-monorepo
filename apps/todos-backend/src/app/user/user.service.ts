import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { User, UserKey } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User, UserKey>
  ) { }
  
  create(user: Partial<User>) {
    return this.userModel.create(user as User);
  }

  findAll() {
    return this.userModel.scan().exec();
  }

  findOne(id: string) {
    return this.userModel.get({ id });
  }

  update(id: string, user: Partial<User>) {
    const payload = { ...(user as Partial<User> & { id?: string }) };
    delete payload.id;

    return this.userModel.update(
      { id },
      {
        $SET: payload as User,
      }
    );
  }

  async remove(id: string) {
    await this.userModel.delete({ id });

    return { deleted: true, id };
  }
}
