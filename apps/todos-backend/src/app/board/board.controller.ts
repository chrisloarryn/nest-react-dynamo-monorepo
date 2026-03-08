import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { Board } from './interfaces/board.interface';
import { Task } from '../task/interfaces/task.interface';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() board: Board) {
    return this.boardService.create(board);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(id);
  }

  @Get(':id/columns')
  findColumnsForBoard(@Param('id') id: string) {
    return this.boardService.findColumnsForBoard(id);
  }

  @Post(':boardId/columns/:columnId/cards')
  createCard(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() task: Task
  ) {
    return this.boardService.createTask(boardId, columnId, task);
  }

  @Delete(':boardId/cards/:cardId')
  deleteCard(
    @Param('boardId') boardId: string,
    @Param('cardId') cardId: string
  ) {
    return this.boardService.deleteTaskById(boardId, cardId);
  }

  @Patch(':boardId/cards/:cardId')
  updateCard(
    @Param('boardId') boardId: string,
    @Param('cardId') cardId: string,
    @Body() task: Task
  ) {
    return this.boardService.updateTask(boardId, cardId, task);
  }

  @Get(':id/cards')
  findCardsForBoard(@Param('id') id: string) {
    return this.boardService.findCardsForBoard(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() board: Board) {
    return this.boardService.update(id, board);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardService.remove(id);
  }
}
