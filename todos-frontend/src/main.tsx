import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import WithStore from "./app/hoc/with-store";
import createStore, { RootState } from './app/store';

import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const AppWithStore = WithStore(App);
const store = createStore().getState() as RootState;

root.render(
  <StrictMode>
    <BrowserRouter>
      <AppWithStore reduxState={store} />
    </BrowserRouter>
  </StrictMode>
);
