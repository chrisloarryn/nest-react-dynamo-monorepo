export type Board = {
  id: string;
  name: string;
  createdBy: string;
  dateCreated: string;
  backgroundImage: string;
  users: string[];
};

export type BoardSlice = {
  board: Board;
  status: string;
  isLoading: boolean;
  error: string;
};
