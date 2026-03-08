import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Cards from './cards';

vi.mock('./card', () => ({
  default: ({
    card,
    showCardDetail,
  }: {
    card: { id: string; title: string };
    showCardDetail: (cardId: string) => void;
  }) => (
    <button type="button" onClick={() => showCardDetail(card.id)}>
      {card.title}
    </button>
  ),
}));

describe('Cards', () => {
  it('renders one Card component per card entry', () => {
    const showCardDetail = vi.fn();

    render(
      <Cards
        showCardDetail={showCardDetail}
        cards={[
          {
            id: 'card-1',
            title: 'First card',
            text: 'One',
            order: 1,
            boardId: 'board-1',
            columnId: 'column-1',
          },
          {
            id: 'card-2',
            title: 'Second card',
            text: 'Two',
            order: 2,
            boardId: 'board-1',
            columnId: 'column-1',
          },
        ]}
      />
    );

    expect(screen.getByText('First card')).toBeTruthy();
    expect(screen.getByText('Second card')).toBeTruthy();
  });
});
