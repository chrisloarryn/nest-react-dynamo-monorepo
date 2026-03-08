import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import type { CardDetail } from '../types/cards';
import type { Column } from '../types/columns';

type ColumnEdge = 'left' | 'right';
type CardEdge = 'top' | 'bottom';

type CardDestination =
  | {
      type: 'card';
      cardId: string;
      edge: CardEdge;
    }
  | {
      type: 'column';
      columnId: string;
    };

const normalizeOrders = <T extends { order: number }>(items: T[]) =>
  items.map((item, index) => ({
    ...item,
    order: index + 1,
  }));

export const sortColumns = (columns: Column[]) =>
  [...columns].sort((left, right) => left.order - right.order);

export const sortCards = (cards: CardDetail[]) =>
  [...cards].sort((left, right) => {
    const byColumn = left.columnId.localeCompare(right.columnId);

    return byColumn !== 0 ? byColumn : left.order - right.order;
  });

export const reorderColumns = (
  columns: Column[],
  sourceColumnId: string,
  targetColumnId: string,
  edge: ColumnEdge
) => {
  const orderedColumns = sortColumns(columns);
  const startIndex = orderedColumns.findIndex((column) => column.id === sourceColumnId);
  const targetIndex = orderedColumns.findIndex((column) => column.id === targetColumnId);

  if (startIndex === -1 || targetIndex === -1) {
    return orderedColumns;
  }

  let finishIndex = targetIndex + (edge === 'right' ? 1 : 0);
  if (startIndex < finishIndex) {
    finishIndex -= 1;
  }

  if (startIndex === finishIndex) {
    return orderedColumns;
  }

  return normalizeOrders(
    reorder({
      list: orderedColumns,
      startIndex,
      finishIndex,
    })
  );
};

const replaceCardsForColumn = (
  allCards: CardDetail[],
  columnId: string,
  nextCards: CardDetail[]
) => [
  ...allCards.filter((card) => card.columnId !== columnId),
  ...nextCards,
];

export const reorderCards = (
  cards: CardDetail[],
  sourceCardId: string,
  destination: CardDestination
) => {
  const orderedCards = sortCards(cards);
  const sourceCard = orderedCards.find((card) => card.id === sourceCardId);

  if (!sourceCard) {
    return orderedCards;
  }

  const sourceColumnId = sourceCard.columnId;
  const sourceColumnCards = orderedCards.filter((card) => card.columnId === sourceColumnId);

  if (destination.type === 'card') {
    const targetCard = orderedCards.find((card) => card.id === destination.cardId);

    if (!targetCard) {
      return orderedCards;
    }

    if (targetCard.columnId === sourceColumnId) {
      const startIndex = sourceColumnCards.findIndex((card) => card.id === sourceCardId);
      const targetIndex = sourceColumnCards.findIndex((card) => card.id === destination.cardId);

      let finishIndex = targetIndex + (destination.edge === 'bottom' ? 1 : 0);
      if (startIndex < finishIndex) {
        finishIndex -= 1;
      }

      if (startIndex === finishIndex) {
        return orderedCards;
      }

      const nextColumnCards = normalizeOrders(
        reorder({
          list: sourceColumnCards,
          startIndex,
          finishIndex,
        })
      );

      return sortCards(replaceCardsForColumn(orderedCards, sourceColumnId, nextColumnCards));
    }

    const nextSourceCards = normalizeOrders(
      sourceColumnCards.filter((card) => card.id !== sourceCardId)
    );
    const destinationCards = orderedCards.filter((card) => card.columnId === targetCard.columnId);
    const targetIndex = destinationCards.findIndex((card) => card.id === destination.cardId);
    const finishIndex = targetIndex + (destination.edge === 'bottom' ? 1 : 0);
    const movedCard = {
      ...sourceCard,
      columnId: targetCard.columnId,
    };
    const nextDestinationCards = normalizeOrders([
      ...destinationCards.slice(0, finishIndex),
      movedCard,
      ...destinationCards.slice(finishIndex),
    ]);

    return sortCards(
      replaceCardsForColumn(
        replaceCardsForColumn(orderedCards, sourceColumnId, nextSourceCards),
        targetCard.columnId,
        nextDestinationCards
      )
    );
  }

  const destinationColumnId = destination.columnId;
  if (destinationColumnId === sourceColumnId) {
    const startIndex = sourceColumnCards.findIndex((card) => card.id === sourceCardId);
    const finishIndex = sourceColumnCards.length - 1;

    if (startIndex === finishIndex) {
      return orderedCards;
    }

    const nextColumnCards = normalizeOrders(
      reorder({
        list: sourceColumnCards,
        startIndex,
        finishIndex,
      })
    );

    return sortCards(replaceCardsForColumn(orderedCards, sourceColumnId, nextColumnCards));
  }

  const destinationCards = orderedCards.filter((card) => card.columnId === destinationColumnId);
  const nextSourceCards = normalizeOrders(
    sourceColumnCards.filter((card) => card.id !== sourceCardId)
  );
  const nextDestinationCards = normalizeOrders([
    ...destinationCards,
    {
      ...sourceCard,
      columnId: destinationColumnId,
    },
  ]);

  return sortCards(
    replaceCardsForColumn(
      replaceCardsForColumn(orderedCards, sourceColumnId, nextSourceCards),
      destinationColumnId,
      nextDestinationCards
    )
  );
};

export const createColumnOrderPatches = (columns: Column[]) =>
  sortColumns(columns).map(({ id, order }) => ({
    id,
    order,
  }));

export const createCardOrderPatches = (cards: CardDetail[], columnIds: string[]) =>
  sortCards(cards)
    .filter((card) => columnIds.includes(card.columnId))
    .map(({ id, order, columnId }) => ({
      id,
      order,
      columnId,
    }));
