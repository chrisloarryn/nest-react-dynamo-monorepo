import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiCreatedResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'Invalid user payload' })
  create(@Body() user: CreateUserDto) {
    return this.userService.create(user);
  }

  @Get()
  @ApiOkResponse({ type: UserDto, isArray: true })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 'user-1' })
  @ApiOkResponse({ type: UserDto })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 'user-1' })
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'Invalid user payload' })
  update(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: 'user-1' })
  @ApiOkResponse({ type: DeleteResponseDto })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
