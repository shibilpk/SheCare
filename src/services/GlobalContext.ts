import React from 'react';

export type GlobalModalContextType = {
  open: () => void;
  close: () => void;
};

const GlobalModalContext = React.createContext<GlobalModalContextType>({
  open: () => {},
  close: () => {},
});

export default GlobalModalContext;
