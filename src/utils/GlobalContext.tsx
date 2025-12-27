import React from 'react';

const GlobalModalContext = React.createContext({
  open: () => {},
  close: () => {},
});

export default GlobalModalContext;
