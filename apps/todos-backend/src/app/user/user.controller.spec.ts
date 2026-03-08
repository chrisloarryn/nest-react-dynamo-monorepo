import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  const userService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('creates a user through the service', async () => {
    const payload = { fullName: 'Ada Lovelace', email: 'ada@example.com' };

    await controller.create(payload);

    expect(userService.create).toHaveBeenCalledWith(payload);
  });

  it('delegates user listing', async () => {
    await controller.findAll();

    expect(userService.findAll).toHaveBeenCalled();
  });

  it('delegates single user retrieval', async () => {
    await controller.findOne('user-1');

    expect(userService.findOne).toHaveBeenCalledWith('user-1');
  });

  it('delegates user update', async () => {
    const payload = { fullName: 'Updated name' };

    await controller.update('user-1', payload);

    expect(userService.update).toHaveBeenCalledWith('user-1', payload);
  });

  it('delegates user removal', async () => {
    await controller.remove('user-1');

    expect(userService.remove).toHaveBeenCalledWith('user-1');
  });
});
