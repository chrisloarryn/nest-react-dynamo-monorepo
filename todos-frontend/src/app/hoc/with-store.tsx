import type { ComponentType } from 'react';
import { Provider } from 'react-redux';
import { setOrGetStore } from '../util/initialise-store';
import type { RootState } from '../store';

type Props = {
  reduxState: RootState;
};

const WithStore = <P extends object>(AppComponent: ComponentType<P>) => {
  const AppWithStore = (props: Props & P) => {
    const { reduxState, ...appProps } = props;

    return (
      <Provider store={setOrGetStore(reduxState)}>
        <AppComponent {...(appProps as P)} />
      </Provider>
    );
  };

  return AppWithStore;
};

export default WithStore;
