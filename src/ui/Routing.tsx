import React, { useContext, useRef, useState } from 'react';
import { RouterController, RouterOptions } from './types';
import { Router } from './Router';
import { last, styledLogMessage, useLazyRef } from '../utils';
import * as RoutingState from '../core/RoutingState';
import * as RouterState from '../core/RouterState';
import { useLogger } from './useLogger';
import { useMemoOne as useMemo } from 'use-memo-one';
import { RoutingContext, RoutingContextValue } from './RoutingContext';

/**
 * Multiple contexts are used to prevent unnesesary rerendering
 */

const ActiveRouterContext = React.createContext<string>({} as any);

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
  const [history, setHistory] = useState<string[]>([Object.keys(routers)[0]!]);
  const log = useLogger();

  const ctxValue = useLazyRef<RoutingContextValue>(() => {
    const ctx: RoutingContextValue = {
      bringToFront: (key: string) => {
        // usememo to check routers
        setHistory(hist => hist.filter(t => t !== key).concat(key));
      },
      exitRouter: (key: string) => {
        setHistory(hist => hist.filter(t => t !== key));
      },
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

  const activeRouterKey = last(history)!;

  return (
    <>
      <RoutingContext.Provider value={ctxValue}>
        <ActiveRouterContext.Provider value={activeRouterKey}>
          {Object.keys(routers).map(routerKey => {
            const routerOpts = routers[routerKey];
            const controls = ctxValue.controllers[routerKey];
            return (
              <Router
                controls={controls}
                key={routerKey ?? DEFAULT_ROUTER_KEY}
                id={routerKey}
                initialState={routerOpts.initialState}
                zIndex={routerOpts.zIndex ?? DEFAULT_Z_INDEX}
                isActive={routerKey === activeRouterKey}
              ></Router>
            );
          })}
          {children}
        </ActiveRouterContext.Provider>
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

export const useActiveRouter = () => {
  return useContext(ActiveRouterContext);
};
