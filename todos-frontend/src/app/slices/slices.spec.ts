import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeStore } from '../store';
import boardReducer, {
  deleteBoard,
  fetchBoard,
  resetBoard,
  saveBoard,
  updateBoardDetail,
} from './board';
import boardsReducer, { createBoard, fetchBoards, resetBoards } from './boards';
import cardsReducer, {
  addCard,
  deleteCard,
  fetchCards,
  persistCardOrders,
  resetCards,
  setCards,
  updateCard,
} from './cards';
import columnsReducer, {
  addColumnToBoard,
  deleteColumn,
  fetchColumns,
  persistColumnOrders,
  resetColumns,
  setColumns,
  updateColumn,
} from './columns';
import userReducer, { fetchUser, resetUserData, updateUserData } from './user';
import usersReducer, { fetchUsers, resetUsersData } from './users';

const fetchMock = vi.fn();

const baseState = {
  boards: {
    boards: [],
    status: 'idle',
    doneFetching: true,
    isRequesting: false,
    error: null,
  },
  user: {
    id: 'user-1',
    status: 'idle',
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    isValid: false,
    isCreating: false,
    isFetching: false,
    message: '',
    error: '',
  },
  board: {
    board: {
      id: 'board-1',
      name: 'Roadmap',
      createdBy: 'user-1',
      dateCreated: '2026-03-08',
      backgroundImage: '',
      users: ['user-1', 'user-2'],
    },
    status: 'idle',
    isLoading: false,
    error: '',
  },
  columns: {
    columns: [
      { id: 'column-2', name: 'Done', order: 2, boardId: 'board-1' },
      { id: 'column-1', name: 'Todo', order: 1, boardId: 'board-1' },
    ],
    status: 'idle',
    isRequesting: false,
    doneFetching: true,
    error: null,
  },
  cards: {
    cards: [
      {
        id: 'card-2',
        title: 'Second',
        text: 'Second card',
        order: 2,
        boardId: 'board-1',
        columnId: 'column-1',
        assignedTo: 'user-2',
      },
      {
        id: 'card-1',
        title: 'First',
        text: 'First card',
        order: 1,
        boardId: 'board-1',
        columnId: 'column-1',
        assignedTo: 'user-1',
      },
    ],
    status: 'idle',
    isRequesting: false,
    isDeleting: false,
    doneFetching: true,
    error: null,
  },
  users: {
    users: [],
    fetching: false,
    status: 'idle',
    error: '',
  },
};

const mockJson = (payload: unknown) =>
  Promise.resolve({
    json: () => Promise.resolve(payload),
  });

describe('slice async flows', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('handles board reducers and async actions', async () => {
    const boardState = boardReducer(undefined, updateBoardDetail({ name: 'Updated' }));
    expect(boardState.board.name).toBe('Updated');
    expect(boardReducer(boardState, resetBoard()).board.name).toBe('');

    const store = makeStore(baseState);
    fetchMock
      .mockImplementationOnce(() =>
        mockJson({
          ...baseState.board.board,
          name: 'Fetched board',
        })
      )
      .mockImplementationOnce(() =>
        mockJson({
          ...baseState.board.board,
          name: 'Saved board',
        })
      )
      .mockImplementationOnce(() =>
        mockJson({
          deleted: true,
          id: 'board-1',
        })
      )
      .mockRejectedValueOnce(new Error('network board'));

    await store.dispatch(fetchBoard('board-1'));
    expect(store.getState().board.board.name).toBe('Fetched board');
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://trello-clone-one.vercel.app/api/boards/board-1'
    );

    await store.dispatch(saveBoard());
    expect(store.getState().board.board.name).toBe('Saved board');
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://trello-clone-one.vercel.app/api/boards/board-1',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...baseState.board.board,
          name: 'Fetched board',
        }),
      })
    );

    await store.dispatch(deleteBoard());
    expect(store.getState().board.status).toBe('success');

    await store.dispatch(fetchBoard('board-1'));
    expect(store.getState().board.status).toBe('failed');
    expect(store.getState().board.error).toContain('network board');
  });

  it('handles boards list creation and failure states', async () => {
    expect(boardsReducer(undefined, resetBoards()).boards).toEqual([]);

    const store = makeStore(baseState);
    fetchMock
      .mockImplementationOnce(() =>
        mockJson([{ ...baseState.board.board, id: 'board-2', name: 'Alpha' }])
      )
      .mockImplementationOnce(() =>
        mockJson({ ...baseState.board.board, id: 'board-3', name: 'Created board' })
      )
      .mockRejectedValueOnce(new Error('create board failed'));

    await store.dispatch(fetchBoards());
    expect(store.getState().boards.boards).toHaveLength(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://trello-clone-one.vercel.app/api/boards?userid=user-1'
    );

    await store.dispatch(createBoard());
    expect(store.getState().boards.boards.at(-1)?.name).toBe('Created board');
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://trello-clone-one.vercel.app/api/boards',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          ...baseState.board.board,
          createdBy: 'user-1',
          backgroundImage: '/boards/board-background.jpg',
        }),
      })
    );

    await store.dispatch(createBoard());
    expect(store.getState().boards.status).toBe('failed');
    expect(store.getState().boards.error).toContain('create board failed');
  });

  it('handles columns reducers, persistence, and failures', async () => {
    const sortedColumns = columnsReducer(
      undefined,
      setColumns([
        { id: 'column-3', name: 'Third', order: 3, boardId: 'board-1' },
        { id: 'column-1', name: 'First', order: 1, boardId: 'board-1' },
      ])
    ).columns;
    expect(sortedColumns.map((column) => column.id)).toEqual(['column-1', 'column-3']);
    expect(columnsReducer(undefined, resetColumns()).columns).toEqual([]);

    const store = makeStore(baseState);
    fetchMock
      .mockImplementationOnce(() =>
        mockJson([
          { id: 'column-2', name: 'Done', order: 2, boardId: 'board-1' },
          { id: 'column-1', name: 'Todo', order: 1, boardId: 'board-1' },
        ])
      )
      .mockImplementationOnce(() =>
        mockJson({
          id: 'column-3',
          name: 'Add title',
          order: 3,
          boardId: 'board-1',
        })
      )
      .mockImplementationOnce(() => mockJson({ deleted: true, id: 'column-1' }))
      .mockImplementationOnce(() =>
        mockJson({
          id: 'column-2',
          name: 'Updated done',
          order: 2,
          boardId: 'board-1',
        })
      )
      .mockImplementationOnce(() =>
        mockJson({
          id: 'column-1',
          name: 'Todo persisted',
          order: 1,
          boardId: 'board-1',
        })
      )
      .mockImplementationOnce(() =>
        mockJson({
          id: 'column-2',
          name: 'Done persisted',
          order: 2,
          boardId: 'board-1',
        })
      )
      .mockRejectedValueOnce(new Error('columns failed'));

    await store.dispatch(fetchColumns());
    expect(store.getState().columns.columns.map((column) => column.id)).toEqual([
      'column-1',
      'column-2',
    ]);

    await store.dispatch(addColumnToBoard());
    expect(store.getState().columns.columns.at(-1)?.id).toBe('column-3');

    await store.dispatch(deleteColumn('column-1'));
    expect(store.getState().columns.columns.find((column) => column.id === 'column-1')).toBeUndefined();

    await store.dispatch(updateColumn({ id: 'column-2', name: 'Updated done' }));
    expect(store.getState().columns.columns.find((column) => column.id === 'column-2')?.name).toBe(
      'Updated done'
    );

    await store.dispatch(
      persistColumnOrders([
        { id: 'column-1', order: 1 },
        { id: 'column-2', order: 2 },
      ])
    );
    expect(store.getState().columns.status).toBe('success');

    await store.dispatch(fetchColumns());
    expect(store.getState().columns.status).toBe('failed');
    expect(store.getState().columns.error).toContain('columns failed');
  });

  it('handles cards reducers, optimistic updates, and failures', async () => {
    const sortedCards = cardsReducer(
      undefined,
      setCards([
        {
          id: 'card-2',
          title: 'Second',
          text: 'Second card',
          order: 2,
          boardId: 'board-1',
          columnId: 'column-1',
        },
        {
          id: 'card-1',
          title: 'First',
          text: 'First card',
          order: 1,
          boardId: 'board-1',
          columnId: 'column-1',
        },
      ])
    ).cards;
    expect(sortedCards.map((card) => card.id)).toEqual(['card-1', 'card-2']);
    expect(cardsReducer(undefined, resetCards()).cards).toEqual([]);

    const store = makeStore(baseState);
    fetchMock
      .mockImplementationOnce(() =>
        mockJson([
          ...baseState.cards.cards,
          {
            id: 'card-3',
            title: 'Third',
            text: 'Third card',
            order: 3,
            boardId: 'board-1',
            columnId: 'column-1',
          },
        ])
      )
      .mockImplementationOnce(() =>
        mockJson({
          id: 'card-4',
          title: 'Add title',
          text: '',
          order: 3,
          boardId: 'board-1',
          columnId: 'column-1',
        })
      )
      .mockImplementationOnce(() => mockJson({ deleted: true, id: 'card-1' }))
      .mockImplementationOnce(() =>
        mockJson({
          id: 'card-2',
          title: 'Updated second',
          text: 'Updated card',
          order: 2,
          boardId: 'board-1',
          columnId: 'column-1',
        })
      )
      .mockImplementationOnce(() =>
        mockJson({
          id: 'card-1',
          title: 'Persisted first',
          text: 'First card',
          order: 1,
          boardId: 'board-1',
          columnId: 'column-1',
        })
      )
      .mockImplementationOnce(() =>
        mockJson({
          id: 'card-2',
          title: 'Persisted second',
          text: 'Second card',
          order: 2,
          boardId: 'board-1',
          columnId: 'column-1',
        })
      )
      .mockRejectedValueOnce(new Error('cards failed'));

    await store.dispatch(fetchCards());
    expect(store.getState().cards.cards).toHaveLength(3);

    await store.dispatch(addCard('column-1'));
    expect(store.getState().cards.cards.at(-1)?.id).toBe('card-4');

    await store.dispatch(deleteCard('card-1'));
    expect(store.getState().cards.cards.find((card) => card.id === 'card-1')).toBeUndefined();

    await store.dispatch(updateCard({ id: 'card-2', title: 'Updated second' }));
    expect(store.getState().cards.cards.find((card) => card.id === 'card-2')?.title).toBe(
      'Updated second'
    );

    await store.dispatch(
      persistCardOrders([
        { id: 'card-1', order: 1 },
        { id: 'card-2', order: 2 },
      ])
    );
    expect(store.getState().cards.status).toBe('success');

    await store.dispatch(fetchCards());
    expect(store.getState().cards.status).toBe('failed');
    expect(store.getState().cards.error).toContain('cards failed');
  });

  it('handles single user and board users flows', async () => {
    const updatedUser = userReducer(undefined, updateUserData({ fullName: 'Jane Doe' }));
    expect(updatedUser.fullName).toBe('Jane Doe');
    expect(userReducer(updatedUser, resetUserData()).fullName).toBe('');
    expect(usersReducer(undefined, resetUsersData()).users).toEqual([]);

    const store = makeStore(baseState);
    fetchMock
      .mockImplementationOnce(() =>
        mockJson({
          id: 'user-1',
          email: 'user-1@example.com',
          fullName: 'User One',
        })
      )
      .mockImplementationOnce(() =>
        mockJson({
          id: 'user-1',
          email: 'user-1@example.com',
          fullName: 'User One',
          avatarUrl: 'https://images.example.com/user-1.png',
        })
      )
      .mockImplementationOnce(() =>
        mockJson({
          id: 'user-2',
          email: 'user-2@example.com',
          fullName: 'User Two',
          avatarUrl: 'https://images.example.com/user-2.png',
        })
      )
      .mockRejectedValueOnce(new Error('missing user'));

    await store.dispatch(fetchUser());
    expect(store.getState().user.fullName).toBe('User One');
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://trello-clone-one.vercel.app/api/users/user-1'
    );

    await store.dispatch(fetchUsers());
    expect(store.getState().users.users.map((user) => user.id)).toEqual(['user-1', 'user-2']);

    await store.dispatch(fetchUser());
    expect(store.getState().user.status).toBe('failed');
    expect(store.getState().user.error).toContain('missing user');
  });
});
