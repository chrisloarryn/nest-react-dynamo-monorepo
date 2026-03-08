import createStore, { type RootState } from '../store';

let store: ReturnType<typeof createStore> | undefined;

export const setOrGetStore = (preloadedState: Partial<RootState> = {}) => {
  let _store = store ?? createStore(preloadedState);

  if (preloadedState && store) {
    _store = createStore({ ...store.getState(), ...preloadedState });
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;

  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};
