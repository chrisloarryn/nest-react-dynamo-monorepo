import { Test, TestingModule } from '@nestjs/testing';
import { ListController } from './list.controller';
import { ListService } from './list.service';

describe('ListController', () => {
  let controller: ListController;
  const listService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListController],
      providers: [
        {
          provide: ListService,
          useValue: listService,
        },
      ],
    }).compile();

    controller = module.get<ListController>(ListController);
  });

  it('creates a column through the service', async () => {
    const payload = { name: 'To Do', order: 1, boardId: 'board-1' };

    await controller.create(payload);

    expect(listService.create).toHaveBeenCalledWith(payload);
  });

  it('delegates column listing', async () => {
    await controller.findAll();

    expect(listService.findAll).toHaveBeenCalled();
  });

  it('delegates single column retrieval', async () => {
    await controller.findOne('column-1');

    expect(listService.findOne).toHaveBeenCalledWith('column-1');
  });

  it('delegates column update', async () => {
    const payload = { name: 'Doing' };

    await controller.update('column-1', payload);

    expect(listService.update).toHaveBeenCalledWith('column-1', payload);
  });

  it('delegates column removal', async () => {
    await controller.remove('column-1');

    expect(listService.remove).toHaveBeenCalledWith('column-1');
  });
});
