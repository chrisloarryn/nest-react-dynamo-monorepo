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
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board, BoardKey } from './interfaces/board.interface';
import { Task, TaskKey } from '../task/interfaces/task.interface';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() createBoardDto: Board) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: BoardKey) {
    return this.boardService.findOne(id);
  }

  @Get(':id/columns')
  findColumnsForBoard(@Param('id') id: BoardKey) {
    return this.boardService.findColumnsForBoard(id);
  }

  @Post(':boardId/columns/:columnId/cards')
  createCard(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() createBoardDto: Task
  ) {
    return this.boardService.createTask(boardId, columnId, createBoardDto);
  }

  /*
  @Post(':boardId/cards/:columnId')
  * deletes the card
  * @param boardId
  * @param columnId
  */
  @Delete(':boardId/cards/:columnId')
  deleteCard(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string
  ) {
    return this.boardService.deleteTaskById(boardId, columnId);
  }

  @Patch(':boardId/cards/:cardId')
  updateCard(
    @Param('boardId') boardId: string,
    @Param('cardId') cardId: string,
    @Body() createBoardDto: Task
  ) {
    return this.boardService.updateTask(boardId, cardId, createBoardDto);
  }

  @Get(':id/cards')
  findCardsForBoard(@Param('id') id: BoardKey) {
    return this.boardService.findCardsForBoard(id);
  }

  @Patch(':id')
  update(@Param('id') id: BoardKey, @Body() updateBoardDto: Board) {
    return this.boardService.update(id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardService.remove(+id);
  }
}
