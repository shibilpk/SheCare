import React from 'react';

export type GlobalModalContextType = {
  open: (date?: Date) => void;
  close: () => void;
};

const GlobalModalContext = React.createContext<GlobalModalContextType>({
  open: () => {},
  close: () => {},
});

export default GlobalModalContext;
