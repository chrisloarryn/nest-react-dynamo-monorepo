import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-dynamoose';
import { TaskStatus } from '../task/interfaces/task.interface';
import { BoardService } from './board.service';

const createModelMock = () => ({
  create: jest.fn(),
  scan: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('BoardService', () => {
  let service: BoardService;
  const boardModel = createModelMock();
  const listModel = createModelMock();
  const taskModel = createModelMock();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getModelToken('Board'),
          useValue: boardModel,
        },
        {
          provide: getModelToken('List'),
          useValue: listModel,
        },
        {
          provide: getModelToken('Task'),
          useValue: taskModel,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('updates a task within a board', async () => {
    taskModel.scan.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ id: 'task-1' }]),
    });
    taskModel.update.mockResolvedValue({ id: 'task-1', boardId: 'board-1' });

    await service.updateTask('board-1', 'task-1', {
      id: 'task-1',
      title: 'Task',
      text: '',
      status: TaskStatus.TODO,
      type: 'task',
      order: 1,
      boardId: 'board-1',
      columnId: 'column-1',
      userId: 'user-1',
      archived: false,
    });

    expect(taskModel.update).toHaveBeenCalledWith(
      { id: 'task-1' },
      expect.objectContaining({ id: 'task-1', boardId: 'board-1' })
    );
  });

  it('deletes a task within a board', async () => {
    taskModel.scan.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ id: 'task-1' }]),
    });
    taskModel.delete.mockResolvedValue(undefined);

    await expect(service.deleteTaskById('board-1', 'task-1')).resolves.toEqual({
      deleted: true,
      id: 'task-1',
    });
    expect(taskModel.delete).toHaveBeenCalledWith({ id: 'task-1' });
  });
});
