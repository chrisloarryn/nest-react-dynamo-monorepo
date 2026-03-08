import { describe, expect, it } from 'vitest';
import type { CardDetail } from '../types/cards';
import type { Column } from '../types/columns';
import {
  createCardOrderPatches,
  createColumnOrderPatches,
  reorderCards,
  reorderColumns,
} from './ordering';

const columns: Column[] = [
  { id: 'col-1', name: 'Todo', order: 1, boardId: 'board-1' },
  { id: 'col-2', name: 'Doing', order: 2, boardId: 'board-1' },
  { id: 'col-3', name: 'Done', order: 3, boardId: 'board-1' },
];

const cards: CardDetail[] = [
  {
    id: 'card-1',
    title: 'One',
    text: '',
    order: 1,
    boardId: 'board-1',
    columnId: 'col-1',
  },
  {
    id: 'card-2',
    title: 'Two',
    text: '',
    order: 2,
    boardId: 'board-1',
    columnId: 'col-1',
  },
  {
    id: 'card-3',
    title: 'Three',
    text: '',
    order: 1,
    boardId: 'board-1',
    columnId: 'col-2',
  },
];

describe('ordering utilities', () => {
  it('reorders columns and renormalizes order', () => {
    const result = reorderColumns(columns, 'col-1', 'col-3', 'right');

    expect(result.map((column) => `${column.id}:${column.order}`)).toEqual([
      'col-2:1',
      'col-3:2',
      'col-1:3',
    ]);
  });

  it('reorders cards within the same column', () => {
    const result = reorderCards(cards, 'card-1', {
      type: 'card',
      cardId: 'card-2',
      edge: 'bottom',
    });

    expect(
      result
        .filter((card) => card.columnId === 'col-1')
        .map((card) => `${card.id}:${card.order}`)
    ).toEqual(['card-2:1', 'card-1:2']);
  });

  it('moves a card to another column and appends it', () => {
    const result = reorderCards(cards, 'card-2', {
      type: 'column',
      columnId: 'col-2',
    });

    expect(
      result
        .filter((card) => card.columnId === 'col-1')
        .map((card) => `${card.id}:${card.order}`)
    ).toEqual(['card-1:1']);
    expect(
      result
        .filter((card) => card.columnId === 'col-2')
        .map((card) => `${card.id}:${card.order}`)
    ).toEqual(['card-3:1', 'card-2:2']);
  });

  it('builds order patches for columns and cards', () => {
    expect(createColumnOrderPatches(columns)).toEqual([
      { id: 'col-1', order: 1 },
      { id: 'col-2', order: 2 },
      { id: 'col-3', order: 3 },
    ]);

    expect(createCardOrderPatches(cards, ['col-1'])).toEqual([
      { id: 'card-1', order: 1, columnId: 'col-1' },
      { id: 'card-2', order: 2, columnId: 'col-1' },
    ]);
  });
});
