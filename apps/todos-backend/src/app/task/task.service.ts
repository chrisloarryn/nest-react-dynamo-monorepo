import { Injectable } from '@nestjs/common';
import { Task, TaskKey } from './interfaces/task.interface';
import { InjectModel, Model } from 'nestjs-dynamoose';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel('Task')
    private readonly taskModel: Model<Task, TaskKey>
  ) { }
  
  create(task: Task) {
    return this.taskModel.create(task);
  }

  findAll() {
    return this.taskModel.scan().exec();
  }

  findOne(id: string) {
    return this.taskModel.get({ id });
  }

  update(id: string, task: Task) {
    return this.taskModel.update({ id }, { ...task, id });
  }

  async remove(id: string) {
    await this.taskModel.delete({ id });

    return { deleted: true, id };
  }
}
