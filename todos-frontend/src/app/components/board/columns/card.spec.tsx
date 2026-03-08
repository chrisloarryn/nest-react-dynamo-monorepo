import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Card from './card';

const mocks = vi.hoisted(() => ({
  draggableMock: vi.fn((config: { onDragStart?: () => void; onDrop?: () => void }) => {
    config.onDragStart?.();
    config.onDrop?.();
    return () => undefined;
  }),
  dropTargetMock: vi.fn(
    (config: {
      canDrop?: (args: { source: { data: Record<string, unknown> } }) => boolean;
      getData?: (args: { input: Record<string, never>; element: HTMLElement }) => unknown;
    }) => {
      config.canDrop?.({
        source: { data: { type: 'card', cardId: 'card-2', columnId: 'column-1' } },
      });
      config.getData?.({
        input: {},
        element: document.createElement('div'),
      });
      return () => undefined;
    }
  ),
  combineMock: vi.fn((...cleanups: Array<() => void>) => () => {
    cleanups.forEach((cleanup) => cleanup());
  }),
  attachClosestEdgeMock: vi.fn((data: unknown) => data),
}));

vi.mock('../../../hooks', () => ({
  useAppSelector: (selector: (state: { users: { users: Array<{ id: string; fullName: string }> } }) => unknown) =>
    selector({
      users: {
        users: [{ id: 'user-1', fullName: 'User One' }],
      },
    }),
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

describe('Card', () => {
  it('renders card content and exposes drag/drop metadata', () => {
    const showCardDetail = vi.fn();

    render(
      <ChakraProvider>
        <Card
          showCardDetail={showCardDetail}
          card={{
            id: 'card-1',
            title: 'Ship validate pipeline',
            text: 'Implement coverage and contracts',
            order: 1,
            boardId: 'board-1',
            columnId: 'column-1',
            assignedTo: 'user-1',
            label: {
              type: 'feature',
              bg: '#61bd4f',
            },
          }}
        />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Ship validate pipeline'));

    expect(showCardDetail).toHaveBeenCalledWith('card-1');
    expect(screen.getByText('feature')).toBeTruthy();
    expect(mocks.draggableMock).toHaveBeenCalled();
    expect(mocks.dropTargetMock).toHaveBeenCalled();
    expect(mocks.attachClosestEdgeMock).toHaveBeenCalledWith({
      type: 'card',
      cardId: 'card-1',
      columnId: 'column-1',
    });
  });
});
