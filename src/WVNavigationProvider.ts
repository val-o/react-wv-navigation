import React, { createContext, useContext } from 'react';

interface WVNavigationContextValue {
  loggingEnabled?: boolean;
  panelOptions?: {
    style?: React.CSSProperties;
    className?: string;
  };
}

const WVNavigationContext = createContext<WVNavigationContextValue>({
  loggingEnabled: false,
});

export const useOptionsContext = () => useContext(WVNavigationContext);
export const WVNavigationProvider = WVNavigationContext.Provider;
