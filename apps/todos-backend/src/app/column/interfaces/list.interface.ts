export interface ListKey {
  id: string;
}

export interface List extends ListKey {
  name: string;
  order: number;
  boardId: string;
  archived: boolean;
  tasks: string[];
}
