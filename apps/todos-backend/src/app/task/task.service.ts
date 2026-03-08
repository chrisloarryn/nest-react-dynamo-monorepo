import { Injectable } from '@nestjs/common';
import { Task, TaskKey } from './interfaces/task.interface';
import { InjectModel, Model } from 'nestjs-dynamoose';

const normaliseTask = (task: Partial<Task>): Partial<Task> => ({
  ...task,
  label: task.label
    ? {
        bg: task.label.bg,
        type: task.label.type,
      }
    : undefined,
});

@Injectable()
export class TaskService {
  constructor(
    @InjectModel('Task')
    private readonly taskModel: Model<Task, TaskKey>
  ) { }
  
  create(task: Partial<Task>) {
    return this.taskModel.create(normaliseTask(task) as Task);
  }

  findAll() {
    return this.taskModel.scan().exec();
  }

  findOne(id: string) {
    return this.taskModel.get({ id });
  }

  update(id: string, task: Partial<Task>) {
    const payload = {
      ...(normaliseTask(task) as Partial<Task> & { id?: string }),
    };
    delete payload.id;

    return this.taskModel.update(
      { id },
      {
        $SET: payload as Task,
      }
    );
  }

  async remove(id: string) {
    await this.taskModel.delete({ id });

    return { deleted: true, id };
  }
}
