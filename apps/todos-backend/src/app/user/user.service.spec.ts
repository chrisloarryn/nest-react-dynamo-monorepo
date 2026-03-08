import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-dynamoose';
import { UserService } from './user.service';

const createModelMock = () => ({
  create: jest.fn(),
  scan: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  const userModel = createModelMock();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: userModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('creates, lists and gets users', async () => {
    const user = { id: 'user-1', fullName: 'Ada' };
    userModel.create.mockResolvedValue(user);
    userModel.scan.mockReturnValue({ exec: jest.fn().mockResolvedValue([user]) });
    userModel.get.mockResolvedValue(user);

    await service.create(user);
    await service.findAll();
    await service.findOne('user-1');

    expect(userModel.create).toHaveBeenCalledWith(user);
    expect(userModel.scan).toHaveBeenCalled();
    expect(userModel.get).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('updates a user by id', async () => {
    userModel.update.mockResolvedValue({ id: 'user-1', fullName: 'Updated Ada' });

    await service.update('user-1', { fullName: 'Updated Ada' });

    expect(userModel.update).toHaveBeenCalledWith(
      { id: 'user-1' },
      expect.objectContaining({
        $SET: expect.objectContaining({ fullName: 'Updated Ada' }),
      })
    );
  });

  it('removes a user by id', async () => {
    userModel.delete.mockResolvedValue(undefined);

    await expect(service.remove('user-1')).resolves.toEqual({
      deleted: true,
      id: 'user-1',
    });
    expect(userModel.delete).toHaveBeenCalledWith({ id: 'user-1' });
  });
});
