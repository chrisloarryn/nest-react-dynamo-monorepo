import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import CardLabel from './card-labels-menu';

const mocks = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
  updateCardMock: vi.fn((payload: unknown) => ({
    type: 'cards/updateCard',
    payload,
  })),
}));

vi.mock('../../../../hooks', () => ({
  useAppDispatch: () => mocks.dispatchMock,
}));

vi.mock('../../../../slices/cards', () => ({
  updateCard: (payload: unknown) => mocks.updateCardMock(payload),
}));

describe('CardLabel', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('dispatches the selected label update', () => {
    mocks.dispatchMock.mockClear();
    mocks.updateCardMock.mockClear();

    render(
      <ChakraProvider>
        <CardLabel id="card-1" />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Labels' }));
    fireEvent.click(screen.getAllByRole('menuitem', { hidden: true })[0]);

    expect(mocks.updateCardMock).toHaveBeenCalledWith({
      id: 'card-1',
      label: {
        type: 'performance',
        bg: '#0079bf',
      },
    });
    expect(mocks.dispatchMock).toHaveBeenCalledWith({
      type: 'cards/updateCard',
      payload: {
        id: 'card-1',
        label: {
          type: 'performance',
          bg: '#0079bf',
        },
      },
    });
  });
});
