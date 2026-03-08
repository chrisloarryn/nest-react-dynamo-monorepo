export type CardDetail = {
  id: string;
  title: string;
  text: string;
  status?: string;
  type?: string;
  order: number;
  columnId: string;
  boardId: string;
  userId?: string;
  assignedTo?: string;
  archived?: boolean;
  label?: Label;
};

export type Label = {
  bg: string;
  type: string;
};

export type CardSlice = {
  cards: CardDetail[];
};
