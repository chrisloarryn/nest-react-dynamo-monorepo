import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import Column from './column';

const mocks = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
  addCardMock: vi.fn((payload: unknown) => ({ type: 'cards/addCard', payload })),
  deleteColumnMock: vi.fn((payload: unknown) => ({
    type: 'columns/deleteColumn',
    payload,
  })),
  updateColumnMock: vi.fn((payload: unknown) => ({
    type: 'columns/updateColumn',
    payload,
  })),
  draggableMock: vi.fn((config: { onDragStart?: () => void; onDrop?: () => void }) => {
    config.onDragStart?.();
    config.onDrop?.();
    return () => undefined;
  }),
  dropTargetMock: vi.fn(
    (config: {
      canDrop?: (args: { source: { data: Record<string, unknown> } }) => boolean;
      getData?: (args: { input: Record<string, never>; element: HTMLElement }) => unknown;
      onDragEnter?: () => void;
      onDragLeave?: () => void;
      onDrop?: () => void;
    }) => {
      config.canDrop?.({
        source: { data: { type: 'card', cardId: 'card-99', columnId: 'column-2' } },
      });
      config.getData?.({
        input: {},
        element: document.createElement('div'),
      });
      config.onDragEnter?.();
      config.onDragLeave?.();
      config.onDrop?.();
      return () => undefined;
    }
  ),
  combineMock: vi.fn((...cleanups: Array<() => void>) => () => {
    cleanups.forEach((cleanup) => cleanup());
  }),
  attachClosestEdgeMock: vi.fn((data: unknown) => data),
}));

vi.mock('../../../hooks', () => ({
  useAppDispatch: () => mocks.dispatchMock,
  useAppSelector: (
    selector: (state: { cards: { isRequesting: boolean } }) => unknown
  ) =>
    selector({
      cards: {
        isRequesting: false,
      },
    }),
}));

vi.mock('../../../slices/cards', () => ({
  addCard: (payload: unknown) => mocks.addCardMock(payload),
}));

vi.mock('../../../slices/columns', () => ({
  deleteColumn: (payload: unknown) => mocks.deleteColumnMock(payload),
  updateColumn: (payload: unknown) => mocks.updateColumnMock(payload),
}));

vi.mock('./cards', () => ({
  default: ({ cards }: { cards: Array<{ id: string; title: string }> }) => (
    <div>{cards.map((card) => card.title).join(', ')}</div>
  ),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: (config: unknown) => mocks.draggableMock(config as never),
  dropTargetForElements: (config: unknown) => mocks.dropTargetMock(config as never),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop/combine', () => ({
  combine: (...cleanups: Array<() => void>) => mocks.combineMock(...cleanups),
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge', () => ({
  attachClosestEdge: (data: unknown) => mocks.attachClosestEdgeMock(data),
}));

describe('Column', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders, edits, and dispatches column actions', async () => {
    vi.useFakeTimers();
    mocks.dispatchMock.mockResolvedValue(undefined).mockClear();
    mocks.addCardMock.mockClear();
    mocks.deleteColumnMock.mockClear();
    mocks.updateColumnMock.mockClear();

    render(
      <ChakraProvider>
        <Column
          showCardDetail={vi.fn()}
          column={{
            id: 'column-1',
            name: 'Todo',
            order: 1,
            boardId: 'board-1',
          }}
          cards={[
            {
              id: 'card-1',
              title: 'First card',
              text: 'Body',
              order: 1,
              boardId: 'board-1',
              columnId: 'column-1',
            },
          ]}
        />
      </ChakraProvider>
    );

    expect(screen.getByText('First card')).toBeTruthy();
    expect(mocks.draggableMock).toHaveBeenCalled();
    expect(mocks.dropTargetMock).toHaveBeenCalledTimes(2);
    expect(mocks.attachClosestEdgeMock).toHaveBeenCalledWith({
      type: 'column',
      columnId: 'column-1',
    });

    fireEvent.click(screen.getByRole('button', { name: /\+ add a card/i }));
    expect(mocks.addCardMock).toHaveBeenCalledWith('column-1');

    fireEvent.click(screen.getByLabelText('Column options'));
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByDisplayValue('Todo'), {
      target: { value: 'Ready for QA' },
    });
    fireEvent.blur(screen.getByDisplayValue('Ready for QA'));

    vi.advanceTimersByTime(450);

    expect(mocks.updateColumnMock).toHaveBeenCalledWith({
      id: 'column-1',
      name: 'Ready for QA',
    });

    fireEvent.click(screen.getByLabelText('Column options'));
    fireEvent.click(screen.getByText('Delete'));

    expect(mocks.deleteColumnMock).toHaveBeenCalledWith('column-1');
  });
});
