import React, { useContext, useMemo, useRef, useState } from 'react';
import { Router, RouterOptions } from './types';
import { MemoryRouter } from './MemoryRouter';
import { styledLogMessage, useLazyRef } from '../utils';
import * as RoutingState from '../core/RoutingState';
import * as RouterState from '../core/RouterState';
import { useLogger } from './useLogger';

interface RoutingStateContextValue {
  state: RoutingState.RoutingState;
}

interface RoutingContextValue {
  bringToFront: (routerKey: string) => void;
  controllers: Record<string, Router>;
};
const RoutingContext = React.createContext<RoutingContextValue>({} as any);
const DEFAULT_ROUTER_KEY = 'default';
const DEFAULT_Z_INDEX = 10;

interface RoutingProps<
  TRouters extends Record<string, RoutingState.RouterOptions>
> {
  routers: TRouters;
}
export const Routing = (
  props: React.PropsWithChildren<
    RoutingProps<Record<string, RoutingState.RouterOptions>>
  >
) => {
  const { routers, children } = props;
  const [state, setState] = useState<RoutingState.RoutingState>({
    activeRouter: Object.values(routers)[0],
  });
  const log = useLogger();
  // const [routersState, setRoutersState] = useState<
  //   Record<string, RoutingS.State>
  // >(() => {
  //   const initialState: Record<string, RoutingS.State> = {};
  //   Object.keys(routers).forEach(key => {
  //     initialState[key] = RoutingS.create(routers[key].initialState);
  //   });
  //   return initialState;
  // });

  const ctxValue = useLazyRef<RoutingContextValue>(() => {
    const ctx: RoutingContextValue = {
      bringToFront: (key: string) =>
        // usememo to check routers
        setState(st => RoutingState.bringToFront(st, routers[key])),
      controllers: {},
    };

    Object.keys(routers).forEach(routerKey => {
      ctx.controllers[routerKey] = {
        markToClearHistoryUntil: undefined as any,
        popScreen: undefined as any,
        pushScreen: undefined as any,
      };
    });

    return ctx;
  }).current;

  return (
    <>
      <RoutingContext.Provider value={ctxValue}>
        {Object.keys(routers).map(routerKey => {
          const routerOpts = routers[routerKey];
          const controls = ctxValue.controllers[routerKey];
          return (
            <MemoryRouter
              controls={controls}
              key={routerKey ?? DEFAULT_ROUTER_KEY}
              id={routerKey}
              initialState={routerOpts.initialState}
              zIndex={routerOpts.zIndex ?? DEFAULT_Z_INDEX}
              isActive={routerOpts === state.activeRouter}
            ></MemoryRouter>
          );
        })}
        {children}
      </RoutingContext.Provider>
    </>
  );
};

export const useRouter = (key: string = DEFAULT_ROUTER_KEY) => {
  const context = useContext(RoutingContext);
  const router = context.controllers[key];
  if (!router) {
    throw new Error(`[Router] Router with key ${key} wasn't found`);
  }

  return router;
};

export const useRouting = (): Pick<RoutingContextValue, 'bringToFront'> => {
  const context = useContext(RoutingContext);

  return context;
};
