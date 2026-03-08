import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-dynamoose';
import { TaskService } from './task.service';

const createModelMock = () => ({
  create: jest.fn(),
  scan: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('TaskService', () => {
  let service: TaskService;
  const taskModel = createModelMock();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken('Task'),
          useValue: taskModel,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('creates, lists and gets tasks', async () => {
    const task = { id: 'task-1', text: 'Task' };
    taskModel.create.mockResolvedValue(task);
    taskModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([task]) });
    taskModel.get.mockResolvedValue(task);

    await service.create(task);
    await service.findAll();
    await service.findOne('task-1');

    expect(taskModel.create).toHaveBeenCalledWith(task);
    expect(taskModel.scan).toHaveBeenCalled();
    expect(taskModel.get).toHaveBeenCalledWith({ id: 'task-1' });
  });

  it('updates a task by id', async () => {
    taskModel.update.mockResolvedValue({ id: 'task-1', title: 'Updated' });

    await service.update('task-1', { title: 'Updated' });

    expect(taskModel.update).toHaveBeenCalledWith(
      { id: 'task-1' },
      expect.objectContaining({
        $SET: expect.objectContaining({ title: 'Updated' }),
      })
    );
  });

  it('removes a task by id', async () => {
    taskModel.delete.mockResolvedValue(undefined);

    await expect(service.remove('task-1')).resolves.toEqual({
      deleted: true,
      id: 'task-1',
    });
    expect(taskModel.delete).toHaveBeenCalledWith({ id: 'task-1' });
  });
});
