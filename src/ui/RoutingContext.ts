import React, { useContext } from 'react';
import { RouterController } from './types';

export interface RoutingContextValue {
  bringToFront: (routerKey: string) => void;
  exitRouter: (routerKey: string) => void;
  controllers: Record<string, RouterController>;
}
export const RoutingContext = React.createContext<RoutingContextValue>(
  {} as any
);

export const useRouting = (): Pick<RoutingContextValue, 'bringToFront'> => {
  const context = useContext(RoutingContext);

  return context;
};

export const useRoutingContext = () => {
  const context = useContext(RoutingContext);

  return context;
};
