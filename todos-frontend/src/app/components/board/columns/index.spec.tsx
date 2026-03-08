import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BoardColumns from './index';

const mocks = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
  monitorConfig: undefined as
    | {
        onDrop: (args: {
          source: { data: Record<string, unknown> };
          location: { current: { dropTargets: Array<{ data: Record<string, unknown> }> } };
        }) => void;
      }
    | undefined,
  state: {
    board: {
      board: {
        id: 'board-1',
        name: 'Roadmap',
        createdBy: 'user-1',
        dateCreated: '2026-03-08',
        backgroundImage: '',
        users: ['user-1', 'user-2'],
      },
    },
    columns: {
      columns: [
        { id: 'column-2', name: 'Done', order: 2, boardId: 'board-1' },
        { id: 'column-1', name: 'Todo', order: 1, boardId: 'board-1' },
      ],
    },
    cards: {
      cards: [
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
          order: 1,
          boardId: 'board-1',
          columnId: 'column-2',
        },
      ],
    },
  },
  fetchBoardMock: vi.fn((id: string) => ({ type: 'board/fetchBoard', payload: id })),
  fetchColumnsMock: vi.fn(() => ({ type: 'columns/fetchColumns' })),
  fetchCardsMock: vi.fn(() => ({ type: 'cards/fetchCards' })),
  fetchUsersMock: vi.fn(() => ({ type: 'users/fetchUsers' })),
  addColumnToBoardMock: vi.fn(() => ({ type: 'columns/addColumnToBoard' })),
  setColumnsMock: vi.fn((payload: unknown) => ({ type: 'columns/setColumns', payload })),
  setCardsMock: vi.fn((payload: unknown) => ({ type: 'cards/setCards', payload })),
  persistColumnOrdersMock: vi.fn((payload: unknown) => ({
    type: 'columns/persistColumnOrders',
    payload,
  })),
  persistCardOrdersMock: vi.fn((payload: unknown) => ({
    type: 'cards/persistCardOrders',
    payload,
  })),
  reorderColumnsMock: vi.fn(() => [
    { id: 'column-2', name: 'Done', order: 1, boardId: 'board-1' },
    { id: 'column-1', name: 'Todo', order: 2, boardId: 'board-1' },
  ]),
  reorderCardsMock: vi.fn(() => [
    {
      id: 'card-2',
      title: 'Second card',
      text: 'Two',
      order: 1,
      boardId: 'board-1',
      columnId: 'column-2',
    },
    {
      id: 'card-1',
      title: 'First card',
      text: 'One',
      order: 2,
      boardId: 'board-1',
      columnId: 'column-2',
    },
  ]),
  createColumnOrderPatchesMock: vi.fn(() => [{ id: 'column-2', order: 1 }]),
  createCardOrderPatchesMock: vi.fn(() => [{ id: 'card-1', order: 2 }]),
}));

vi.mock('../../../hooks', () => ({
  useAppDispatch: () => mocks.dispatchMock,
  useAppSelector: (
    selector: (appState: typeof mocks.state) => unknown
  ) => selector(mocks.state),
}));

vi.mock('../../../slices/board', () => ({
  fetchBoard: (id: string) => mocks.fetchBoardMock(id),
}));

vi.mock('../../../slices/columns', () => ({
  addColumnToBoard: () => mocks.addColumnToBoardMock(),
  fetchColumns: () => mocks.fetchColumnsMock(),
  persistColumnOrders: (payload: unknown) => mocks.persistColumnOrdersMock(payload),
  setColumns: (payload: unknown) => mocks.setColumnsMock(payload),
}));

vi.mock('../../../slices/cards', () => ({
  fetchCards: () => mocks.fetchCardsMock(),
  persistCardOrders: (payload: unknown) => mocks.persistCardOrdersMock(payload),
  setCards: (payload: unknown) => mocks.setCardsMock(payload),
}));

vi.mock('../../../slices/users', () => ({
  fetchUsers: () => mocks.fetchUsersMock(),
}));

vi.mock('../../../util/ordering', () => ({
  createCardOrderPatches: (cards: unknown, columns: string[]) =>
    mocks.createCardOrderPatchesMock(cards, columns),
  createColumnOrderPatches: (columns: unknown) => mocks.createColumnOrderPatchesMock(columns),
  reorderCards: (
    cards: unknown,
    sourceId: string,
    target: Record<string, unknown>
  ) => mocks.reorderCardsMock(cards, sourceId, target),
  reorderColumns: (
    columns: unknown,
    sourceId: string,
    targetId: string,
    edge: string
  ) => mocks.reorderColumnsMock(columns, sourceId, targetId, edge),
}));

vi.mock('./buttons/add-column-button', () => ({
  default: ({ addColumn }: { addColumn: () => Promise<void> }) => (
    <button type="button" onClick={() => void addColumn()}>
      Add Column Mock
    </button>
  ),
}));

vi.mock('./column', () => ({
  default: ({
    column,
    cards,
    showCardDetail,
  }: {
    column: { id: string; name: string };
    cards: Array<{ id: string }>;
    showCardDetail: (cardId: string) => void;
  }) => (
    <button type="button" onClick={() => showCardDetail(cards[0]?.id ?? '')}>
      {column.name}
    </button>
  ),
}));

vi.mock('./modals/card-details-modal', () => ({
  default: ({
    card,
    onClose,
  }: {
    card: { title: string };
    onClose: () => void;
  }) => (
    <div>
      <span>{card.title}</span>
      <button type="button" onClick={onClose}>
        Close Details
      </button>
    </div>
  ),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  monitorForElements: (config: typeof mocks.monitorConfig) => {
    mocks.monitorConfig = config;
    return () => undefined;
  },
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
  extractClosestEdge: (data: { edge?: string }) => data.edge,
}));

describe('BoardColumns', () => {
  it('fetches board data, opens card details, and adds columns', () => {
    mocks.dispatchMock.mockResolvedValue(undefined).mockClear();

    render(
      <ChakraProvider>
        <BoardColumns />
      </ChakraProvider>
    );

    expect(mocks.fetchBoardMock).toHaveBeenCalledWith('board-1');
    expect(mocks.fetchColumnsMock).toHaveBeenCalled();
    expect(mocks.fetchCardsMock).toHaveBeenCalled();
    expect(mocks.fetchUsersMock).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Todo'));
    expect(screen.getByText('First card')).toBeTruthy();

    fireEvent.click(screen.getByText('Close Details'));
    expect(screen.queryByText('First card')).toBeNull();

    fireEvent.click(screen.getByText('Add Column Mock'));
    expect(mocks.addColumnToBoardMock).toHaveBeenCalled();
  });

  it('handles column drag-and-drop ordering', () => {
    mocks.dispatchMock.mockResolvedValue(undefined).mockClear();

    render(
      <ChakraProvider>
        <BoardColumns />
      </ChakraProvider>
    );

    if (!mocks.monitorConfig) {
      throw new Error('monitorForElements was not initialised');
    }

    mocks.monitorConfig.onDrop({
      source: {
        data: {
          type: 'column',
          columnId: 'column-1',
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                type: 'column',
                columnId: 'column-2',
                edge: 'right',
              },
            },
          ],
        },
      },
    });

    expect(mocks.reorderColumnsMock).toHaveBeenCalledWith(
      mocks.state.columns.columns,
      'column-1',
      'column-2',
      'right'
    );
    expect(mocks.setColumnsMock).toHaveBeenCalled();
    expect(mocks.createColumnOrderPatchesMock).toHaveBeenCalled();
    expect(mocks.persistColumnOrdersMock).toHaveBeenCalledWith([{ id: 'column-2', order: 1 }]);
  });

  it('handles card drag-and-drop for card targets and column targets', () => {
    mocks.dispatchMock.mockResolvedValue(undefined).mockClear();

    render(
      <ChakraProvider>
        <BoardColumns />
      </ChakraProvider>
    );

    if (!mocks.monitorConfig) {
      throw new Error('monitorForElements was not initialised');
    }

    mocks.monitorConfig.onDrop({
      source: {
        data: {
          type: 'card',
          cardId: 'card-1',
          columnId: 'column-1',
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                type: 'card',
                cardId: 'card-2',
                columnId: 'column-2',
                edge: 'bottom',
              },
            },
          ],
        },
      },
    });

    expect(mocks.reorderCardsMock).toHaveBeenCalledWith(mocks.state.cards.cards, 'card-1', {
      type: 'card',
      cardId: 'card-2',
      edge: 'bottom',
    });
    expect(mocks.setCardsMock).toHaveBeenCalled();
    expect(mocks.createCardOrderPatchesMock).toHaveBeenCalledWith(expect.any(Array), [
      'column-1',
      'column-2',
    ]);

    mocks.monitorConfig.onDrop({
      source: {
        data: {
          type: 'card',
          cardId: 'card-1',
          columnId: 'column-1',
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                type: 'column-body',
                columnId: 'column-2',
              },
            },
          ],
        },
      },
    });

    expect(mocks.reorderCardsMock).toHaveBeenCalledWith(mocks.state.cards.cards, 'card-1', {
      type: 'column',
      columnId: 'column-2',
    });
    expect(mocks.persistCardOrdersMock).toHaveBeenCalledWith([{ id: 'card-1', order: 2 }]);
  });
});
