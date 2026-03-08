import { describe, expect, it } from 'vitest';
import {
  isCardDragData,
  isColumnBodyDropData,
  isColumnDragData,
} from './dnd-data';

describe('dnd-data guards', () => {
  it('detects valid and invalid column drag data', () => {
    expect(isColumnDragData({ type: 'column', columnId: 'column-1' })).toBe(true);
    expect(isColumnDragData({ type: 'column', columnId: 1 })).toBe(false);
  });

  it('detects valid and invalid card drag data', () => {
    expect(
      isCardDragData({ type: 'card', cardId: 'card-1', columnId: 'column-1' })
    ).toBe(true);
    expect(isCardDragData({ type: 'card', cardId: 'card-1' })).toBe(false);
  });

  it('detects valid and invalid column body drop data', () => {
    expect(isColumnBodyDropData({ type: 'column-body', columnId: 'column-1' })).toBe(true);
    expect(isColumnBodyDropData({ type: 'column-body', columnId: null })).toBe(false);
  });
});
