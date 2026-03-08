import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import checkEnvironment from '../util/check-environment';
import type { RootState } from '../store';
import type { Board, BoardSlice } from '../types/boards';

const initialBoard: Board = {
  id: '59a22152-ad94-45e4-bd02-c903258c76a7',
  name: '',
  createdBy: '',
  dateCreated: '',
  backgroundImage: '',
  users: [],
};

const initialState: BoardSlice = {
  board: initialBoard,
  status: 'idle',
  isLoading: false,
  error: '',
};

const host = checkEnvironment();

export const saveBoard = createAsyncThunk<Board, void, { state: RootState }>(
  'board/save',
  async (_, { getState }) => {
    const board = getState().board.board;
    const response = await fetch(`${host}/api/boards/${board.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(board),
    });

    return response.json();
  }
);

export const fetchBoard = createAsyncThunk<Board, string>(
  'board/get',
  async (id) => {
    const response = await fetch(`${host}/api/boards/${id}`);

    return response.json();
  }
);

export const deleteBoard = createAsyncThunk<{ deleted: boolean; id: string }, void, { state: RootState }>(
  'board/delete',
  async (_, { getState }) => {
    const boardId = getState().board.board.id;
    const response = await fetch(`${host}/api/boards/${boardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    updateBoardDetail: (state, action) => {
      state.board = {
        ...state.board,
        ...action.payload,
      };
    },
    resetBoard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.board = action.payload;
        state.status = 'success';
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to fetch board';
      })
      .addCase(saveBoard.pending, (state) => {
        state.status = 'pending';
        state.isLoading = true;
      })
      .addCase(saveBoard.fulfilled, (state, action) => {
        state.board = action.payload;
        state.isLoading = false;
        state.status = 'success';
      })
      .addCase(saveBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.error.message ?? 'Unable to save board';
      })
      .addCase(deleteBoard.pending, (state) => {
        state.status = 'pending';
        state.isLoading = true;
      })
      .addCase(deleteBoard.fulfilled, (state) => {
        state.isLoading = false;
        state.status = 'success';
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.error.message ?? 'Unable to delete board';
      });
  },
});

export const { updateBoardDetail, resetBoard } = boardSlice.actions;

export default boardSlice.reducer;
