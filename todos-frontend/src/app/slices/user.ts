import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import checkEnvironment from '../util/check-environment';
import type { UserDetail } from '../types/user';

const initialState: UserDetail = {
  id: 'a567b908-b640-422c-978c-a7381c0b3925',
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
};

const host = checkEnvironment();

export const fetchUser = createAsyncThunk<
  { id: string; email: string; fullName: string },
  void,
  { state: { user: UserDetail } }
>('users/fetchUser', async (_, { getState }) => {
  const userId = getState().user.id;
  const response = await fetch(`${host}/api/users/${userId}`);

  return response.json();
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUserData: (state, action) => {
      Object.assign(state, action.payload);
    },
    resetUserData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'success';
        state.id = action.payload.id;
        state.email = action.payload.email;
        state.fullName = action.payload.fullName;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to fetch user';
      });
  },
});

export const { updateUserData, resetUserData } = userSlice.actions;

export default userSlice.reducer;
