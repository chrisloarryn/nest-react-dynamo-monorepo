export type Column = {
  id: string;
  name: string;
  order: number;
  boardId: string;
  archived?: boolean;
  tasks?: string[];
};

export type ColumnsSlice = {
  columns: Column[];
  status: string;
  doneFetching: boolean;
};
