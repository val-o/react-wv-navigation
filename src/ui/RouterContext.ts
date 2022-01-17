import React from 'react';
import { RouterApi } from '../core/RouterController';

export const RouterContext = React.createContext<RouterApi>({
  markToClearHistoryUntil: () => {},
  popScreen: () => {},
  pushScreen: () => {},
});
RouterContext.displayName = 'RouterContext';

export const useRouter = () => {
  const api = React.useContext(RouterContext);
  return api;
};
