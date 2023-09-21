import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Board, BoardKey } from './interfaces/board.interface';
import { Task, TaskKey } from '../task/interfaces/task.interface';
import { List, ListKey } from '../column/interfaces/list.interface';

@Injectable()
export class BoardService {
  constructor(
    @InjectModel('Board')
    private readonly boardModel: Model<Board, BoardKey>,
    @InjectModel('List')
    private readonly listModel: Model<List, ListKey>,
    @InjectModel('Task')
    private readonly taskModel: Model<Task, TaskKey>
  ) {}
  create(createBoardDto: Board) {
    return this.boardModel.create(createBoardDto);
  }

  createTask(boardId: string, columnId: string, createTaskDto: Task) {
    createTaskDto.boardId = boardId;
    createTaskDto.columnId = columnId;

    const payload: Task = {
      ...createTaskDto,
      boardId,
      columnId,
    };

    Logger.debug(`createTaskDto`, JSON.stringify(payload, null, 2));

    Logger.debug('boardId', boardId);
    Logger.debug('columnId', columnId);

    return this.taskModel.create(payload);
  }

  async deleteTaskById(boardId: string, cardId: string) {
    const existsTaskByBoardIdAndCardId =
      await this.existsTaskByBoardIdAndTaskId(boardId, cardId);

    if (!existsTaskByBoardIdAndCardId) {
      throw new NotFoundException('Task not found');
    }

    return this.taskModel.delete({ id: cardId });
  }

  async updateTask(boardId: string, taskId: string, createTaskDto: Task) {
    const existsTaskByBoardIdAndColumnId =
      await this.existsTaskByBoardIdAndTaskId(boardId, taskId);

    if (!existsTaskByBoardIdAndColumnId) {
      throw new NotFoundException('Task not found');
    }

    createTaskDto.boardId = boardId;
    return this.taskModel.create(createTaskDto);
  }

  async existsTaskByBoardIdAndTaskId(
    boardId: string,
    taskId: string
  ): Promise<boolean> {
    const tasks = await this.taskModel.scan({ boardId, id: taskId }).exec();

    Logger.debug('tasks', JSON.stringify(tasks, null, 2));

    return tasks.length > 0;
  }

  async existsTaskByBoardIdAndColumnId(
    boardId: string,
    columnId: string
  ): Promise<boolean> {
    const tasks = await this.taskModel.scan({ boardId, columnId }).exec();

    Logger.debug('tasks', JSON.stringify(tasks, null, 2));

    return tasks.length > 0;
  }

  findAll() {
    return this.boardModel.scan().exec();
  }

  findOne(id: BoardKey) {
    return this.boardModel.get(id);
  }

  findColumnsForBoard(id: BoardKey) {
    return this.listModel.scan({ boardId: id }).exec();
  }

  findCardsForBoard(id: BoardKey) {
    return this.taskModel.scan({ boardId: id }).exec();
  }

  update(id: BoardKey, updateBoardDto: Board) {
    return this.boardModel.update(id, updateBoardDto);
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
