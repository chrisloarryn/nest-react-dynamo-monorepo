import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import checkEnvironment from '../util/check-environment';
import type { RootState } from '../store';

type BoardUser = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
};

type UsersState = {
  users: BoardUser[];
  fetching: boolean;
  status: 'idle' | 'pending' | 'success' | 'failed';
  error: string;
};

const initialState: UsersState = {
  users: [],
  fetching: false,
  status: 'idle',
  error: '',
};

const host = checkEnvironment();

export const fetchUsers = createAsyncThunk<BoardUser[], void, { state: RootState }>(
  'users/fetchUsers',
  async (_, { getState }) => {
    const board = getState().board.board;
    const ids = Array.from(new Set([board.createdBy, ...board.users].filter(Boolean)));

    const responses = await Promise.all(ids.map((id) => fetch(`${host}/api/users/${id}`)));

    return Promise.all(responses.map((response) => response.json()));
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsersData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'success';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to fetch users';
      });
  },
});

export const { resetUsersData } = usersSlice.actions;

export default usersSlice.reducer;
