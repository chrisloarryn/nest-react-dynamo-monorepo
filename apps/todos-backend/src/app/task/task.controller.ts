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
import { TaskService } from './task.service';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiCreatedResponse({ type: TaskDto })
  @ApiBadRequestResponse({ description: 'Invalid task payload' })
  create(@Body() task: CreateTaskDto) {
    return this.taskService.create(task);
  }

  @Get()
  @ApiOkResponse({ type: TaskDto, isArray: true })
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 'task-1' })
  @ApiOkResponse({ type: TaskDto })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 'task-1' })
  @ApiOkResponse({ type: TaskDto })
  @ApiBadRequestResponse({ description: 'Invalid task payload' })
  update(@Param('id') id: string, @Body() task: UpdateTaskDto) {
    return this.taskService.update(id, task);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: 'task-1' })
  @ApiOkResponse({ type: DeleteResponseDto })
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
