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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BoardService } from './board.service';
import { BoardDto } from './dto/board.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';
import { ListDto } from '../column/dto/list.dto';
import { TaskDto } from '../task/dto/task.dto';
import { CreateTaskDto } from '../task/dto/create-task.dto';
import { UpdateTaskDto } from '../task/dto/update-task.dto';

@ApiTags('boards')
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @ApiCreatedResponse({ type: BoardDto })
  @ApiBadRequestResponse({ description: 'Invalid board payload' })
  create(@Body() board: CreateBoardDto) {
    return this.boardService.create(board);
  }

  @Get()
  @ApiOkResponse({ type: BoardDto, isArray: true })
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 'board-1' })
  @ApiOkResponse({ type: BoardDto })
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(id);
  }

  @Get(':id/columns')
  @ApiParam({ name: 'id', example: 'board-1' })
  @ApiOkResponse({ type: ListDto, isArray: true })
  findColumnsForBoard(@Param('id') id: string) {
    return this.boardService.findColumnsForBoard(id);
  }

  @Post(':boardId/columns/:columnId/cards')
  @ApiParam({ name: 'boardId', example: 'board-1' })
  @ApiParam({ name: 'columnId', example: 'column-1' })
  @ApiCreatedResponse({ type: TaskDto })
  @ApiBadRequestResponse({ description: 'Invalid task payload' })
  createCard(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() task: CreateTaskDto
  ) {
    return this.boardService.createTask(boardId, columnId, task);
  }

  @Delete(':boardId/cards/:cardId')
  @ApiParam({ name: 'boardId', example: 'board-1' })
  @ApiParam({ name: 'cardId', example: 'task-1' })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Task not found' })
  deleteCard(
    @Param('boardId') boardId: string,
    @Param('cardId') cardId: string
  ) {
    return this.boardService.deleteTaskById(boardId, cardId);
  }

  @Patch(':boardId/cards/:cardId')
  @ApiParam({ name: 'boardId', example: 'board-1' })
  @ApiParam({ name: 'cardId', example: 'task-1' })
  @ApiOkResponse({ type: TaskDto })
  @ApiBadRequestResponse({ description: 'Invalid task payload' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  updateCard(
    @Param('boardId') boardId: string,
    @Param('cardId') cardId: string,
    @Body() task: UpdateTaskDto
  ) {
    return this.boardService.updateTask(boardId, cardId, task);
  }

  @Get(':id/cards')
  @ApiParam({ name: 'id', example: 'board-1' })
  @ApiOkResponse({ type: TaskDto, isArray: true })
  findCardsForBoard(@Param('id') id: string) {
    return this.boardService.findCardsForBoard(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', example: 'board-1' })
  @ApiOkResponse({ type: BoardDto })
  @ApiBadRequestResponse({ description: 'Invalid board payload' })
  update(@Param('id') id: string, @Body() board: UpdateBoardDto) {
    return this.boardService.update(id, board);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: 'board-1' })
  @ApiOkResponse({ type: DeleteResponseDto })
  remove(@Param('id') id: string) {
    return this.boardService.remove(id);
  }
}
