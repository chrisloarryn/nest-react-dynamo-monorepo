export type ColumnDragData = {
  type: 'column';
  columnId: string;
};

export type CardDragData = {
  type: 'card';
  cardId: string;
  columnId: string;
};

export type ColumnBodyDropData = {
  type: 'column-body';
  columnId: string;
};

export type BoardDragData = ColumnDragData | CardDragData | ColumnBodyDropData;

export const isColumnDragData = (
  data: Record<string | symbol, unknown>
): data is ColumnDragData =>
  data.type === 'column' && typeof data.columnId === 'string';

export const isCardDragData = (
  data: Record<string | symbol, unknown>
): data is CardDragData =>
  data.type === 'card' &&
  typeof data.cardId === 'string' &&
  typeof data.columnId === 'string';

export const isColumnBodyDropData = (
  data: Record<string | symbol, unknown>
): data is ColumnBodyDropData =>
  data.type === 'column-body' && typeof data.columnId === 'string';
