import styled from 'styled-components';

import NxWelcome from './nx-welcome';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

import { Route, Routes, Link } from 'react-router-dom';
import { TodoPage } from './pages/todo';
// import 'nprogress/nprogress.css';

const StyledApp = styled.div`
  // Your style here
`;


const theme = extendTheme({
  colors: {
    brand: '#0079bf',
    success: '#70b500',
    danger: '#eb5a46',
    info: '#ff9f1a',
    warning: '#f2d600',
    darkblue: '#eae6ff',
    lightblue: '#f2faf9',
    performance: '#0079bf',
    bug: '#eb5a46',
    feature: '#61bd4f',
    information: '#ff9f1a'
  }
});

export function App() {
  return (
      <ChakraProvider theme={theme}>

    <StyledApp>
      {/* <NxWelcome title="todo-react" /> */}
      <br />
      <hr />
      <br />
      {/* <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/todos">Todos</Link>
          </li>
        </ul>
      </div> */}
      <Routes>
        <Route
          path="/"
          Component={TodoPage}
        />
      </Routes>
      {/* END: routes */}
      </StyledApp>
      </ChakraProvider>
  );
}

export default App;
