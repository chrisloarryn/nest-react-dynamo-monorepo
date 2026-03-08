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
  title?: string;
  text: string;
  status: TaskStatus;
  type: string;
  order: number;
  boardId: string;
  columnId: string;
  userId: string;
  assignedTo?: string;
  label?: {
    bg: string;
    type: string;
  };
  archived: boolean;
}
