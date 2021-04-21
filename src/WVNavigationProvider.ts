import { createContext } from 'react';

interface WVNavigationContextValue {
  loggingEnabled?: boolean;
}

const WVNavigationContext = createContext<WVNavigationContextValue>({
  loggingEnabled: false,
});
