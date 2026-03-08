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

  it('should be defined', () => {
    expect(service).toBeDefined();
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
