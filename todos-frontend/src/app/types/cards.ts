export type CardDetail = {
  id: string;
  title: string;
  text: string;
  columnId?: string;
  assignedTo?: string;
  boardId?: string;
  sequence?: number;
  label?: Label;
};

export type Label = {
  bg: string;
  type: string;
};

export type CardSlice = {
  cards: CardDetail[];
};
