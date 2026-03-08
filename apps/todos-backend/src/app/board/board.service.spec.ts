import { NotFoundException } from '@nestjs/common';
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
        { provide: getModelToken('Board'), useValue: boardModel },
        { provide: getModelToken('List'), useValue: listModel },
        { provide: getModelToken('Task'), useValue: taskModel },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });
  it('creates a board', async () => {
    const board = { name: 'Roadmap', createdBy: 'user-1' };
    boardModel.create.mockResolvedValue(board);

    await service.create(board);

    expect(boardModel.create).toHaveBeenCalledWith(board);
  });

  it('creates a task within a board and column', async () => {
    taskModel.create.mockResolvedValue({ id: 'task-1' });

    await service.createTask('board-1', 'column-1', {
      title: 'Task',
      text: 'Create validate workflow',
      status: TaskStatus.TODO,
      type: 'task',
      order: 1,
      boardId: 'ignored-board',
      columnId: 'ignored-column',
      userId: 'user-1',
      archived: false,
    });

    expect(taskModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        boardId: 'board-1',
        columnId: 'column-1',
        userId: 'user-1',
      })
    );
  });

  it('throws when deleting a missing task', async () => {
    taskModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    await expect(service.deleteTaskById('board-1', 'task-1')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('deletes a task within a board', async () => {
    taskModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([{ id: 'task-1' }]) });
    taskModel.delete.mockResolvedValue(undefined);

    await expect(service.deleteTaskById('board-1', 'task-1')).resolves.toEqual({
      deleted: true,
      id: 'task-1',
    });
    expect(taskModel.delete).toHaveBeenCalledWith({ id: 'task-1' });
  });

  it('throws when updating a missing task', async () => {
    taskModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    await expect(service.updateTask('board-1', 'task-1', { title: 'Missing' })).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('updates a task within a board', async () => {
    taskModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([{ id: 'task-1' }]) });
    taskModel.update.mockResolvedValue({ id: 'task-1', boardId: 'board-1' });

    await service.updateTask('board-1', 'task-1', {
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
      expect.objectContaining({
        $SET: expect.objectContaining({ boardId: 'board-1' }),
      })
    );
  });

  it('checks whether tasks exist for a board and column', async () => {
    taskModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([{ id: 'task-1' }]) });

    await expect(service.existsTaskByBoardIdAndColumnId('board-1', 'column-1')).resolves.toBe(true);
  });

  it('lists boards, columns and cards for a board', async () => {
    boardModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    listModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    taskModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    await service.findAll();
    await service.findColumnsForBoard('board-1');
    await service.findCardsForBoard('board-1');

    expect(boardModel.scan).toHaveBeenCalled();
    expect(listModel.scan).toHaveBeenCalledWith({ boardId: 'board-1' });
    expect(taskModel.scan).toHaveBeenCalledWith({ boardId: 'board-1' });
  });

  it('retrieves, updates and deletes a board', async () => {
    boardModel.get.mockResolvedValue({ id: 'board-1' });
    boardModel.update.mockResolvedValue({ id: 'board-1', name: 'Updated' });
    boardModel.delete.mockResolvedValue(undefined);

    await service.findOne('board-1');
    await service.update('board-1', { name: 'Updated' });
    await expect(service.remove('board-1')).resolves.toEqual({ deleted: true, id: 'board-1' });

    expect(boardModel.get).toHaveBeenCalledWith({ id: 'board-1' });
    expect(boardModel.update).toHaveBeenCalledWith(
      { id: 'board-1' },
      expect.objectContaining({
        $SET: expect.objectContaining({ name: 'Updated' }),
      })
    );
    expect(boardModel.delete).toHaveBeenCalledWith({ id: 'board-1' });
  });
});
