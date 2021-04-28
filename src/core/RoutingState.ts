import * as RouterState from './RouterState';

export interface RoutingState {
  activeRouter: RouterOptions;
}

export interface RouterOptions {
  zIndex?: number;
  initialState?: RouterState.HistoryEntry[];
}

export interface RoutingOptions<
  TRouters extends Record<string, RouterOptions>
> {
  routers: TRouters;
}

export const bringToFront = (
  st: RoutingState,
  router: RouterOptions,
): RoutingState => {
  if (st.activeRouter === router) {
    return st;
  }
  return {
    activeRouter: router,
  };
};
