import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Board, BoardKey } from './interfaces/board.interface';
import { Task, TaskKey } from '../task/interfaces/task.interface';
import { List, ListKey } from '../column/interfaces/list.interface';

const normaliseTask = (task: Partial<Task>): Partial<Task> => ({
  ...task,
  label: task.label
    ? {
        bg: task.label.bg,
        type: task.label.type,
      }
    : undefined,
});

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

  create(board: Partial<Board>) {
    return this.boardModel.create(board as Board);
  }

  createTask(boardId: string, columnId: string, task: Partial<Task>) {
    const payload: Task = {
      ...normaliseTask(task),
      boardId,
      columnId,
    } as Task;

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

  async updateTask(boardId: string, taskId: string, task: Partial<Task>) {
    const existsTaskByBoardIdAndTaskId = await this.existsTaskByBoardIdAndTaskId(
      boardId,
      taskId
    );

    if (!existsTaskByBoardIdAndTaskId) {
      throw new NotFoundException('Task not found');
    }

    const payload = {
      ...(normaliseTask(task) as Partial<Task> & { id?: string }),
    };
    delete payload.id;

    return this.taskModel.update(
      { id: taskId },
      {
        $SET: {
          ...payload,
          boardId,
        },
      }
    );
  }

  async existsTaskByBoardIdAndTaskId(
    boardId: string,
    taskId: string
  ): Promise<boolean> {
    const tasks = await this.taskModel.scan({ boardId, id: taskId }).exec();

    return tasks.length > 0;
  }

  async existsTaskByBoardIdAndColumnId(
    boardId: string,
    columnId: string
  ): Promise<boolean> {
    const tasks = await this.taskModel.scan({ boardId, columnId }).exec();

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

  update(id: string, board: Partial<Board>) {
    const payload = { ...(board as Partial<Board> & { id?: string }) };
    delete payload.id;

    return this.boardModel.update(
      { id },
      {
        $SET: payload as Board,
      }
    );
  }

  async remove(id: string) {
    await this.boardModel.delete({ id });

    return { deleted: true, id };
  }
}
