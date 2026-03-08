import { configureStore } from '@reduxjs/toolkit';
import boardsSlice from './slices/boards';
import userSlice from './slices/user';
import boardSlice from './slices/board';
import columnsSlice from './slices/columns';
import cardsSlice from './slices/cards';
import usersSlice from './slices/users';

const reducer = {
  boards: boardsSlice,
  user: userSlice,
  board: boardSlice,
  columns: columnsSlice,
  cards: cardsSlice,
  users: usersSlice,
};

type StoreState = {
  boards: ReturnType<typeof boardsSlice>;
  user: ReturnType<typeof userSlice>;
  board: ReturnType<typeof boardSlice>;
  columns: ReturnType<typeof columnsSlice>;
  cards: ReturnType<typeof cardsSlice>;
  users: ReturnType<typeof usersSlice>;
};

export const makeStore = (preloadedState?: Partial<StoreState>) =>
  configureStore({
    reducer,
    preloadedState: preloadedState as StoreState | undefined,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = StoreState;
export type AppDispatch = AppStore['dispatch'];

const createStore = makeStore;

export default createStore;
