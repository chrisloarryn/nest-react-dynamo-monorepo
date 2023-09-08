import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskKey } from './interfaces/task.interface';
import { InjectModel, Model } from 'nestjs-dynamoose';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel('Task')
    private readonly taskModel: Model<Task, TaskKey>
  ) { }
  
  create(createTaskDto: Task) {
    return this.taskModel.create(createTaskDto);
  }

  findAll() {
    return this.taskModel.scan().exec();
  }

  findOne(id: TaskKey) {
    return this.taskModel.get(id);
  }

  update(id: TaskKey, updateTaskDto: Task) {
    return this.taskModel.update(id, updateTaskDto);
  }

  remove(id: TaskKey) {
    return this.taskModel.delete(id);
  }
}
