import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-dynamoose';
import { ListService } from './list.service';

const createModelMock = () => ({
  create: jest.fn(),
  scan: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ListService', () => {
  let service: ListService;
  const listModel = createModelMock();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: getModelToken('List'),
          useValue: listModel,
        },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('updates a list by id', async () => {
    listModel.update.mockResolvedValue({ id: 'list-1', name: 'Doing' });

    await service.update('list-1', {
      id: 'list-1',
      name: 'Doing',
      order: 2,
      boardId: 'board-1',
      archived: false,
      tasks: [],
    });

    expect(listModel.update).toHaveBeenCalledWith(
      { id: 'list-1' },
      expect.objectContaining({ name: 'Doing' })
    );
  });
});
