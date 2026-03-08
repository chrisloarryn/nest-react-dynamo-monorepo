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

  it('should be defined', () => {
    expect(service).toBeDefined();
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
