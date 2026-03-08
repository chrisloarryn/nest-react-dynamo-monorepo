import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TaskStatus } from '../task/interfaces/task.interface';

describe('BoardController', () => {
  let controller: BoardController;
  const boardService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findColumnsForBoard: jest.fn(),
    createTask: jest.fn(),
    deleteTaskById: jest.fn(),
    updateTask: jest.fn(),
    findCardsForBoard: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: boardService,
        },
      ],
    }).compile();

    controller = module.get<BoardController>(BoardController);
  });

  it('creates a board through the service', async () => {
    const payload = { name: 'Roadmap', createdBy: 'user-1' };

    await controller.create(payload);

    expect(boardService.create).toHaveBeenCalledWith(payload);
  });

  it('delegates board listing to the service', async () => {
    await controller.findAll();

    expect(boardService.findAll).toHaveBeenCalled();
  });

  it('delegates single board retrieval to the service', async () => {
    await controller.findOne('board-1');

    expect(boardService.findOne).toHaveBeenCalledWith('board-1');
  });

  it('delegates column listing for a board', async () => {
    await controller.findColumnsForBoard('board-1');

    expect(boardService.findColumnsForBoard).toHaveBeenCalledWith('board-1');
  });

  it('creates a card inside a board column', async () => {
    const payload = {
      text: 'Card',
      status: TaskStatus.TODO,
      type: 'task' as const,
      order: 1,
      boardId: 'board-1',
      columnId: 'column-1',
      userId: 'user-1',
    };

    await controller.createCard('board-1', 'column-1', payload);

    expect(boardService.createTask).toHaveBeenCalledWith('board-1', 'column-1', payload);
  });

  it('deletes a card inside a board', async () => {
    await controller.deleteCard('board-1', 'task-1');

    expect(boardService.deleteTaskById).toHaveBeenCalledWith('board-1', 'task-1');
  });

  it('updates a card inside a board', async () => {
    const payload = { title: 'Updated title' };

    await controller.updateCard('board-1', 'task-1', payload);

    expect(boardService.updateTask).toHaveBeenCalledWith('board-1', 'task-1', payload);
  });

  it('delegates board card listing', async () => {
    await controller.findCardsForBoard('board-1');

    expect(boardService.findCardsForBoard).toHaveBeenCalledWith('board-1');
  });

  it('updates a board through the service', async () => {
    const payload = { name: 'Updated board' };

    await controller.update('board-1', payload);

    expect(boardService.update).toHaveBeenCalledWith('board-1', payload);
  });

  it('removes a board through the service', async () => {
    await controller.remove('board-1');

    expect(boardService.remove).toHaveBeenCalledWith('board-1');
  });
});
