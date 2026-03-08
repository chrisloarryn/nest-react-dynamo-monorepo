import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import CardDetailsModal from './card-details-modal';

const mocks = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
  updateCardMock: vi.fn((payload: unknown) => ({
    type: 'cards/updateCard',
    payload,
  })),
  deleteCardMock: vi.fn((payload: unknown) => ({
    type: 'cards/deleteCard',
    payload,
  })),
  selectorState: {
    cards: {
      isRequesting: false,
      isDeleting: false,
    },
    users: {
      users: [
        { id: 'user-1', fullName: 'User One' },
        { id: 'user-2', fullName: 'User Two' },
      ],
    },
  },
}));

vi.mock('../../../../hooks', () => ({
  useAppDispatch: () => mocks.dispatchMock,
  useAppSelector: (
    selector: (state: typeof mocks.selectorState) => unknown
  ) => selector(mocks.selectorState),
}));

vi.mock('../../../../slices/cards', () => ({
  updateCard: (payload: unknown) => mocks.updateCardMock(payload),
  deleteCard: (payload: unknown) => mocks.deleteCardMock(payload),
}));

vi.mock('../../../../components/quill-editor', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="description-editor"
      defaultValue={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('./card-labels-menu', () => ({
  default: ({ id }: { id: string }) => <div>Labels for {id}</div>,
}));

describe('CardDetailsModal', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('updates the card and closes the modal', async () => {
    mocks.dispatchMock.mockResolvedValue(undefined).mockClear();
    mocks.updateCardMock.mockClear();

    const onClose = vi.fn();

    render(
      <ChakraProvider>
        <CardDetailsModal
          isOpen
          onClose={onClose}
          card={{
            id: 'card-1',
            title: 'Initial title',
            text: 'Initial description',
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

    fireEvent.change(screen.getByPlaceholderText('Card title'), {
      target: { value: 'Updated title' },
    });
    fireEvent.change(screen.getByLabelText('description-editor'), {
      target: { value: 'Updated description' },
    });

    fireEvent.click(screen.getByRole('button', { name: /assign to/i }));
    fireEvent.click(screen.getByText('User Two'));

    expect(mocks.updateCardMock).toHaveBeenCalledWith({
      id: 'card-1',
      assignedTo: 'user-2',
    });

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await Promise.resolve();

    expect(mocks.updateCardMock).toHaveBeenLastCalledWith({
      id: 'card-1',
      title: 'Updated title',
      text: 'Updated description',
      columnId: 'column-1',
      assignedTo: 'user-2',
    });
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByText('feature')).toBeTruthy();
    expect(screen.getByText('Labels for card-1')).toBeTruthy();
  });

  it('deletes the card and closes the modal', async () => {
    mocks.dispatchMock.mockResolvedValue(undefined).mockClear();
    mocks.deleteCardMock.mockClear();

    const onClose = vi.fn();

    render(
      <ChakraProvider>
        <CardDetailsModal
          isOpen
          onClose={onClose}
          card={{
            id: 'card-2',
            title: 'Another card',
            text: 'Description',
            order: 1,
            boardId: 'board-1',
            columnId: 'column-1',
          }}
        />
      </ChakraProvider>
    );

    const deleteButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent === '');

    if (!deleteButton) {
      throw new Error('Delete button not found');
    }

    fireEvent.click(deleteButton);
    await Promise.resolve();

    expect(mocks.deleteCardMock).toHaveBeenCalledWith('card-2');
    expect(onClose).toHaveBeenCalled();
  });
});
