import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import checkEnvironment from '../util/check-environment';
import type { RootState } from '../store';
import type { Column } from '../types/columns';

type ColumnPatch = Pick<Column, 'id'> & Partial<Omit<Column, 'id'>>;

type ColumnsState = {
  columns: Column[];
  status: 'idle' | 'pending' | 'success' | 'failed';
  isRequesting: boolean;
  doneFetching: boolean;
  error: string | null;
};

const initialState: ColumnsState = {
  columns: [],
  status: 'idle',
  isRequesting: false,
  doneFetching: true,
  error: null,
};

const host = checkEnvironment();

const sortColumns = (columns: Column[]) =>
  [...columns].sort((left, right) => left.order - right.order);

export const fetchColumns = createAsyncThunk<Column[], void, { state: RootState }>(
  'columns/fetchColumns',
  async (_, { getState }) => {
    const boardId = getState().board.board.id;
    const response = await fetch(`${host}/api/boards/${boardId}/columns`);

    return response.json();
  }
);

export const deleteColumn = createAsyncThunk<{ deleted: boolean; id: string }, string, { state: RootState }>(
  'columns/deleteColumn',
  async (columnId) => {
    const response = await fetch(`${host}/api/columns/${columnId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.json();
  }
);

export const addColumnToBoard = createAsyncThunk<Column, void, { state: RootState }>(
  'columns/addColumnToBoard',
  async (_, { getState }) => {
    const state = getState();
    const boardId = state.board.board.id;
    const userId = state.user.id;
    const order = state.columns.columns.reduce((max, column) => Math.max(max, column.order), 0) + 1;

    const response = await fetch(`${host}/api/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boardId,
        name: 'Add title',
        userId,
        order,
        archived: false,
        tasks: [],
      }),
    });

    return response.json();
  }
);

export const updateColumn = createAsyncThunk<Column, ColumnPatch>(
  'columns/updateColumn',
  async (column) => {
    const { id, ...payload } = column;
    const response = await fetch(`${host}/api/columns/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }
);

export const persistColumnOrders = createAsyncThunk<ColumnPatch[], ColumnPatch[]>(
  'columns/persistColumnOrders',
  async (patches, { dispatch }) => {
    await Promise.all(
      patches.map((patch) => dispatch(updateColumn(patch)).unwrap())
    );

    return patches;
  }
);

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    resetColumns: () => initialState,
    setColumns: (state, action: PayloadAction<Column[]>) => {
      state.columns = sortColumns(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addColumnToBoard.pending, (state) => {
        state.status = 'pending';
        state.isRequesting = true;
      })
      .addCase(addColumnToBoard.fulfilled, (state, action) => {
        state.columns = sortColumns([...state.columns, action.payload]);
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(addColumnToBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.isRequesting = false;
        state.error = action.error.message ?? 'Unable to add column';
      })
      .addCase(fetchColumns.pending, (state) => {
        state.status = 'pending';
        state.isRequesting = true;
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.columns = sortColumns(action.payload);
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.status = 'failed';
        state.isRequesting = false;
        state.error = action.error.message ?? 'Unable to fetch columns';
      })
      .addCase(deleteColumn.pending, (state) => {
        state.status = 'pending';
        state.isRequesting = true;
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter((column) => column.id !== action.payload.id);
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.status = 'failed';
        state.isRequesting = false;
        state.error = action.error.message ?? 'Unable to delete column';
      })
      .addCase(updateColumn.pending, (state) => {
        state.status = 'pending';
        state.isRequesting = true;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        state.columns = sortColumns(
          state.columns.map((column) => (column.id === action.payload.id ? action.payload : column))
        );
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.status = 'failed';
        state.isRequesting = false;
        state.error = action.error.message ?? 'Unable to update column';
      })
      .addCase(persistColumnOrders.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(persistColumnOrders.fulfilled, (state) => {
        state.status = 'success';
      })
      .addCase(persistColumnOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to persist column order';
      });
  },
});

export const { resetColumns, setColumns } = columnsSlice.actions;

export default columnsSlice.reducer;
