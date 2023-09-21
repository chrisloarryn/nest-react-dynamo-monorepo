import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { setOrGetStore } from '../util/initialise-store';
import { RootState } from '../store';
import { JSX } from 'react/jsx-runtime';

type Props = {
  reduxState: RootState;
};

const WithStore = (App: JSX.IntrinsicAttributes & any) => {
  class AppWithStore extends Component<Props> {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(props: Props | Readonly<Props>) {
      super(props);
    }

    static async getInitialProps(ctx: { reduxState: any; }) {
      let appProps = {};
      if (App.getInitialProps) {
        appProps = await App.getInitialProps(ctx);
      }

      return {
        ...appProps,
        reduxState: ctx.reduxState || setOrGetStore().getState()
      };
    }

    render() {
      return (
        <Provider store={setOrGetStore(this.props.reduxState)}>
          <App />
        </Provider>
      );
    }
  }

  return AppWithStore;
};

export default WithStore;
