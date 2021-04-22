import * as RoutingS from '../core/RoutingState';

export interface IRouterOptions {
  key?: string;
  initialState?: RoutingS.HistoryEntry[];
  zIndex?: number;
}

export interface IRouter {
  pushScreen(options: RoutingS.PushOptions): void;
  popScreen<TPopExtras extends object = {}>(
    options?: RoutingS.PopOptions<TPopExtras>
  ): void;
  /**
   * Mark to remove all the screens until key provided, when next pushScreen will happen.
   * @param key
   * @param including
   */
  markToClearHistoryUntil(opts: RoutingS.ClearHistoryOptions): void;
}
