import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface MockModeContextType {
  isMockMode: boolean;
  setMockMode: (value: boolean) => void;
}

const MockModeContext = createContext<MockModeContextType>({
  isMockMode: false,
  setMockMode: () => {},
});

export function MockModeProvider({ children }: { children: ReactNode }) {
  const [isMockMode, setIsMockMode] = useState(false);

  const setMockMode = useCallback((value: boolean) => {
    setIsMockMode(value);
  }, []);

  return (
    <MockModeContext.Provider value={{ isMockMode, setMockMode }}>
      {children}
    </MockModeContext.Provider>
  );
}

export function useMockMode() {
  return useContext(MockModeContext);
}
