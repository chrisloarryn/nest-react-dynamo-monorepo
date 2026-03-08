import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskStatus } from './interfaces/task.interface';

describe('TaskController', () => {
  let controller: TaskController;
  const taskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: taskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('creates a task through the service', async () => {
    const payload = {
      text: 'Task',
      status: TaskStatus.TODO,
      type: 'task' as const,
      order: 1,
      boardId: 'board-1',
      columnId: 'column-1',
      userId: 'user-1',
    };

    await controller.create(payload);

    expect(taskService.create).toHaveBeenCalledWith(payload);
  });

  it('delegates task listing', async () => {
    await controller.findAll();

    expect(taskService.findAll).toHaveBeenCalled();
  });

  it('delegates single task retrieval', async () => {
    await controller.findOne('task-1');

    expect(taskService.findOne).toHaveBeenCalledWith('task-1');
  });

  it('delegates task update', async () => {
    const payload = { title: 'Updated title' };

    await controller.update('task-1', payload);

    expect(taskService.update).toHaveBeenCalledWith('task-1', payload);
  });

  it('delegates task removal', async () => {
    await controller.remove('task-1');

    expect(taskService.remove).toHaveBeenCalledWith('task-1');
  });
});
