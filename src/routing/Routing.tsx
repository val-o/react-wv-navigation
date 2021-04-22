import React, { useContext, useRef } from 'react';
import { IRouter, IRouterOptions } from './types';
import { MemoryRouter } from './MemoryRouter';
import { useLazyRef } from '../utils';

type IContextValue = Record<string, IRouter>;
const MemoryNavigationContext = React.createContext<IContextValue>({} as any);
const DEFAULT_ROUTER_KEY = 'default';

interface IProps {
  routers: IRouterOptions[];
}
export const Routing: React.FC<IProps> = props => {
  const { routers, children } = props;
  const controllers = useLazyRef<IContextValue>(() => {
    return routers.reduce((res, r) => {
      res[r.key ?? DEFAULT_ROUTER_KEY] = {
        markToClearHistoryUntil: undefined as any,
        popScreen: undefined as any,
        pushScreen: undefined as any,
      };
      return res;
    }, {} as IContextValue);
  }).current;

  return (
    <>
      <MemoryNavigationContext.Provider value={controllers}>
        {routers.map((router, idx) => (
          <MemoryRouter
            controls={controllers[router.key ?? DEFAULT_ROUTER_KEY]}
            key={router.key ?? DEFAULT_ROUTER_KEY}
            initialState={router.initialState}
            zIndex={router.zIndex}
          ></MemoryRouter>
        ))}
        {children}
      </MemoryNavigationContext.Provider>
    </>
  );
};

export const useRouter = (key: string = DEFAULT_ROUTER_KEY) => {
  const context = useContext(MemoryNavigationContext);
  const router = context[key];
  if (!router) {
    throw new Error(`[Router] Router with key ${key} wasn't found`);
  }

  return router;
};
