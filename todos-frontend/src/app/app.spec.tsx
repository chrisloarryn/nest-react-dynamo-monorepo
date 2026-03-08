import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './app';
import createStore from './store';

describe('App', () => {
  const renderApp = () =>
    render(
      <Provider store={createStore()}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

  it('should render successfully', () => {
    const { baseElement } = renderApp();
    expect(baseElement).toBeTruthy();
  });

  it('should render the board route', () => {
    const { container } = renderApp();
    expect(container.querySelector('[class]')).toBeTruthy();
  });
});
