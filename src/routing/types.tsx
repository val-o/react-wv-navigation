import React from 'react';

export type IHistoryEntry = {
  key: string;
  originalScreenEl: React.ReactElement;
  keepInHistory?: boolean;
};

export interface IClearHistoryOptions {
  untilKey: string;
  including: boolean;
}

export interface IRouterOptions {
  key?: string;
  initialState?: IHistoryEntry[];
  zIndex?: number;
}

export interface IRouter {
  pushScreen(options: IPushOptions): void;
  popScreen<TPopExtras extends object = {}>(options?: IPopOptions<TPopExtras>): void;
  /**
   * Mark to remove all the screens until key provided, when next pushScreen will happen.
   * @param key
   * @param including
   */
  markToClearHistoryUntil(opts: IClearHistoryOptions): void;
}

export interface IPopOptions<TPopExtras extends object = {}> {
  /**
   * NOTE: Check for markToClearHistoryUntil method as well, this might be a better option, if you know which screens should be unloaded ahead
   * Go back to screen and clear all history in between
   */
  toScreen?: string;
  including?: boolean;
  /**
   * Pass extra options to screen we're popping to
   */
  popExtras?: TPopExtras;
}

export interface IPushOptions {
  /**
   * If next was pushed after this one, whether we should store this screen in history
   */
  keepInHistory?: boolean;
  screen: React.ReactElement;
  key: string;
}

export interface IPopExtrasProps<PopExtras extends {}> {
  popExtras?: PopExtras;
}
