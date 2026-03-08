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

  it('creates, lists and gets columns', async () => {
    const column = { id: 'column-1', name: 'Doing' };
    listModel.create.mockResolvedValue(column);
    listModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([column]) });
    listModel.get.mockResolvedValue(column);

    await service.create(column);
    await service.findAll();
    await service.findOne('column-1');

    expect(listModel.create).toHaveBeenCalledWith(column);
    expect(listModel.scan).toHaveBeenCalled();
    expect(listModel.get).toHaveBeenCalledWith({ id: 'column-1' });
  });

  it('updates a list by id', async () => {
    listModel.update.mockResolvedValue({ id: 'list-1', name: 'Doing' });

    await service.update('list-1', {
      name: 'Doing',
      order: 2,
    });

    expect(listModel.update).toHaveBeenCalledWith(
      { id: 'list-1' },
      expect.objectContaining({
        $SET: expect.objectContaining({ name: 'Doing' }),
      })
    );
  });

  it('removes a list by id', async () => {
    listModel.delete.mockResolvedValue(undefined);

    await expect(service.remove('list-1')).resolves.toEqual({
      deleted: true,
      id: 'list-1',
    });
    expect(listModel.delete).toHaveBeenCalledWith({ id: 'list-1' });
  });
});
