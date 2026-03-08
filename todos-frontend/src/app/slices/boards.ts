import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import checkEnvironment from '../util/check-environment';
import type { RootState } from '../store';
import type { Board } from '../types/boards';

type BoardsState = {
  boards: Board[];
  status: 'idle' | 'pending' | 'success' | 'failed';
  doneFetching: boolean;
  isRequesting: boolean;
  error: string | null;
};

const initialState: BoardsState = {
  boards: [],
  status: 'idle',
  doneFetching: true,
  isRequesting: false,
  error: null,
};

const host = checkEnvironment();

export const fetchBoards = createAsyncThunk<Board[], void, { state: RootState }>(
  'boards/fetchBoards',
  async (_, { getState }) => {
    const userId = getState().user.id;
    const response = await fetch(`${host}/api/boards?userid=${userId}`);

    return response.json();
  }
);

export const createBoard = createAsyncThunk<Board, void, { state: RootState }>(
  'boards/createBoard',
  async (_, { getState }) => {
    const state = getState();
    const board = state.board.board;
    const response = await fetch(`${host}/api/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...board,
        createdBy: state.user.id,
        backgroundImage: board.backgroundImage || '/boards/board-background.jpg',
      }),
    });

    return response.json();
  }
);

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    resetBoards: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.boards = action.payload;
        state.status = 'success';
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to fetch boards';
      })
      .addCase(createBoard.pending, (state) => {
        state.isRequesting = true;
        state.status = 'pending';
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards = [...state.boards, action.payload];
        state.isRequesting = false;
        state.status = 'success';
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.isRequesting = false;
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to create board';
      });
  },
});

export const { resetBoards } = boardsSlice.actions;

export default boardsSlice.reducer;
