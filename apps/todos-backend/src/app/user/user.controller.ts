import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserKey } from './interfaces/user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: User) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: UserKey) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: UserKey, @Body() updateUserDto: User) {
    return this.userService.update(id, updateUserDto);
  }
  
  @Delete(':id')
  remove(@Param('id') id: UserKey) {
    return this.userService.remove(id);
  }
}
