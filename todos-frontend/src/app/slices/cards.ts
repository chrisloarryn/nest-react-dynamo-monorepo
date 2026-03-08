import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import checkEnvironment from '../util/check-environment';
import type { RootState } from '../store';
import type { CardDetail } from '../types/cards';

type CardPatch = Pick<CardDetail, 'id'> & Partial<Omit<CardDetail, 'id'>>;

type CardsState = {
  cards: CardDetail[];
  status: 'idle' | 'pending' | 'success' | 'failed';
  isRequesting: boolean;
  isDeleting: boolean;
  doneFetching: boolean;
  error: string | null;
};

const initialState: CardsState = {
  cards: [],
  status: 'idle',
  isRequesting: false,
  isDeleting: false,
  doneFetching: true,
  error: null,
};

const host = checkEnvironment();

const sortCards = (cards: CardDetail[]) =>
  [...cards].sort((left, right) => left.order - right.order);

export const fetchCards = createAsyncThunk<CardDetail[], void, { state: RootState }>(
  'cards/fetchCards',
  async (_, { getState }) => {
    const boardId = getState().board.board.id;
    const response = await fetch(`${host}/api/boards/${boardId}/cards`);

    return response.json();
  }
);

export const deleteCard = createAsyncThunk<{ deleted: boolean; id: string }, string, { state: RootState }>(
  'cards/deleteCard',
  async (cardId, { getState }) => {
    const boardId = getState().board.board.id;
    const response = await fetch(`${host}/api/boards/${boardId}/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }
);

export const addCard = createAsyncThunk<CardDetail, string, { state: RootState }>(
  'cards/addCard',
  async (columnId, { getState }) => {
    const state = getState();
    const boardId = state.board.board.id;
    const userId = state.user.id;
    const columnCards = state.cards.cards.filter((card) => card.columnId === columnId);
    const order = columnCards.reduce((max, card) => Math.max(max, card.order), 0) + 1;

    const response = await fetch(`${host}/api/boards/${boardId}/columns/${columnId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        columnId,
        title: 'Add title',
        text: '',
        type: 'task',
        status: 'todo',
        userId,
        assignedTo: '',
        order,
        archived: false,
      }),
    });

    return response.json();
  }
);

export const updateCard = createAsyncThunk<CardDetail, CardPatch, { state: RootState }>(
  'cards/updateCard',
  async (card, { getState }) => {
    const boardId = getState().board.board.id;
    const { id, ...payload } = card;
    const response = await fetch(`${host}/api/boards/${boardId}/cards/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }
);

export const persistCardOrders = createAsyncThunk<CardPatch[], CardPatch[], { state: RootState }>(
  'cards/persistCardOrders',
  async (patches, { dispatch }) => {
    await Promise.all(
      patches.map((patch) => dispatch(updateCard(patch)).unwrap())
    );

    return patches;
  }
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    resetCards: () => initialState,
    setCards: (state, action: PayloadAction<CardDetail[]>) => {
      state.cards = sortCards(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCard.pending, (state) => {
        state.isRequesting = true;
        state.status = 'pending';
      })
      .addCase(addCard.fulfilled, (state, action) => {
        state.cards = sortCards([...state.cards, action.payload]);
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(addCard.rejected, (state, action) => {
        state.status = 'failed';
        state.isRequesting = false;
        state.error = action.error.message ?? 'Unable to add card';
      })
      .addCase(fetchCards.pending, (state) => {
        state.status = 'pending';
        state.isRequesting = true;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.cards = sortCards(action.payload);
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.status = 'failed';
        state.isRequesting = false;
        state.error = action.error.message ?? 'Unable to fetch cards';
      })
      .addCase(deleteCard.pending, (state) => {
        state.status = 'pending';
        state.isDeleting = true;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.cards = state.cards.filter((card) => card.id !== action.payload.id);
        state.status = 'success';
        state.isDeleting = false;
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.status = 'failed';
        state.isDeleting = false;
        state.error = action.error.message ?? 'Unable to delete card';
      })
      .addCase(updateCard.pending, (state) => {
        state.status = 'pending';
        state.isRequesting = true;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.cards = sortCards(
          state.cards.map((card) => (card.id === action.payload.id ? action.payload : card))
        );
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.status = 'failed';
        state.isRequesting = false;
        state.error = action.error.message ?? 'Unable to update card';
      })
      .addCase(persistCardOrders.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(persistCardOrders.fulfilled, (state) => {
        state.status = 'success';
      })
      .addCase(persistCardOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to persist card order';
      });
  },
});

export const { resetCards, setCards } = cardsSlice.actions;

export default cardsSlice.reducer;
