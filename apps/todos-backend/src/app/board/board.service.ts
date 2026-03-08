import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

  create(board: Board) {
    return this.boardModel.create(board);
  }

  createTask(boardId: string, columnId: string, task: Task) {
    const payload: Task = {
      ...task,
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

    await this.taskModel.delete({ id: cardId });

    return { deleted: true, id: cardId };
  }

  async updateTask(boardId: string, taskId: string, task: Task) {
    const existsTaskByBoardIdAndTaskId = await this.existsTaskByBoardIdAndTaskId(
      boardId,
      taskId
    );

    if (!existsTaskByBoardIdAndTaskId) {
      throw new NotFoundException('Task not found');
    }

    return this.taskModel.update(
      { id: taskId },
      {
        ...task,
        id: taskId,
        boardId,
      }
    );
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

  findOne(id: string) {
    return this.boardModel.get({ id });
  }

  findColumnsForBoard(id: string) {
    return this.listModel.scan({ boardId: id }).exec();
  }

  findCardsForBoard(id: string) {
    return this.taskModel.scan({ boardId: id }).exec();
  }

  update(id: string, board: Board) {
    return this.boardModel.update({ id }, { ...board, id });
  }

  async remove(id: string) {
    await this.boardModel.delete({ id });

    return { deleted: true, id };
  }
}
