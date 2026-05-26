import React, { createContext, useContext, useState } from 'react';

export type Screen = 'home' | 'pasaporte' | 'vendedor' | 'ranking';

interface NavContextValue {
  screen: Screen;
  navigate: (s: Screen) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavContext = createContext<NavContextValue>({
  screen: 'home',
  navigate: () => {},
  goBack: () => {},
  canGoBack: false,
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<Screen[]>(['home']);

  const screen = history[history.length - 1];

  const navigate = (s: Screen) => {
    setHistory(prev => {
      if (prev[prev.length - 1] === s) return prev;
      return [...prev, s];
    });
  };

  const goBack = () => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const canGoBack = history.length > 1;

  return (
    <NavContext.Provider value={{ screen, navigate, goBack, canGoBack }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);
