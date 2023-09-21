import { v4 } from 'uuid';

export enum TaskStatus {
  COMPLETED = 'completed',
  DONE = 'done',
  DOING = 'doing',
  BLOCKED = 'blocked',
  PENDING = 'pending',
  TODO = 'todo',
}

export interface TaskKey {
  id: string;
}

export interface Task extends TaskKey {
  text: string;
  status: TaskStatus;
  type: string;
  order: number;
  boardId: string;
  columnId: string;
  userId: string;
  archived: boolean;
}

const stubTask: Task = {
  id: v4(),
  text: 'Task 1',
  status: TaskStatus.TODO,
  type: 'task',
  order: 1,
  boardId: v4(),
  columnId: v4(),
  userId: v4(),
  archived: false,
};
