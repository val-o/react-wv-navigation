import RoutingState from 'react';
import { compact, isDefined, last } from '../utils';
import { Direction } from './Direction';

export type HistoryEntry = {
  key: string;
  originalScreenEl: RoutingState.ReactElement;
  keepInHistory?: boolean;
};

export interface State {
  items: HistoryEntry[];
  queuedItems: HistoryEntry[];
  isNavigating: boolean;
  poppingEntry: HistoryEntry | undefined;
}

export interface ClearHistoryOptions {
  untilKey: string;
  including: boolean;
}

export const create = (initialItems?: HistoryEntry[]): State => {
  return {
    isNavigating: false,
    items: initialItems ?? [],
    queuedItems: [],
    poppingEntry: undefined,
  };
};

export interface PushOptions {
  /**
   * React element of screen
   */
  screen: RoutingState.ReactElement;
  /**
   * Unique key
   */
  key: string;
  /**
   * If next was pushed after this one, whether we should store this screen in history
   */
  keepInHistory?: boolean;

  enterDirection?: Direction;
  exitDirection?: Direction;
}

export interface PopOptions<TPopExtras extends object = {}> {
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

export interface PopExtrasProps<PopExtras extends object> {
  popExtras?: PopExtras;
}

export const getActiveEntry = (st: State): HistoryEntry | undefined =>
  last(st.items);

export const pushScreen = (
  state: State,
  options: PushOptions
): [State, PushError | undefined] => {
  if (
    state.items.some(entry => entry.key === options.key) ||
    state.queuedItems.some(entry => entry.key === options.key)
  ) {
    return [state, { type: 'DuplicateKeyFound', key: options.key }];
  }

  if (state.isNavigating) {
    const entry: HistoryEntry = {
      key: options.key,
      originalScreenEl: options.screen,
      keepInHistory: options.keepInHistory,
    };
    return [
      {
        ...state,
        queuedItems: [...state.queuedItems, entry],
      },
      undefined,
    ];
  }

  const newItems = [
    ...state.items,
    {
      key: options.key,
      originalScreenEl: options.screen,
      keepInHistory: options.keepInHistory,
    },
  ];

  return [
    {
      ...state,
      isNavigating: true,
      items: newItems,
    },
    undefined,
  ];
};

export const popScreen = (
  state: State,
  options?: PopOptions
): [State, PopError | undefined] => {
  if (state.isNavigating) {
    return [state, navigationInProgressError];
  }

  const activeScreen = getActiveEntry(state);

  if (!activeScreen) {
    return [state, { type: 'NoActiveScreen' }];
  }

  const getNewActiveScreenIdx = (): number | undefined => {
    if (options?.toScreen) {
      const result = state.items.findIndex(e => e.key === options.toScreen);
      // Exit if no screen has been found
      return result < 0 ? undefined : result;
    }

    return state.items.length - 2;
  };

  let newActiveScreenIdx = getNewActiveScreenIdx();

  if (!isDefined(newActiveScreenIdx)) {
    return [state, newScreenNotFoundError];
  }

  newActiveScreenIdx = options?.including
    ? newActiveScreenIdx - 1
    : newActiveScreenIdx;

  if (newActiveScreenIdx < 0) {
    return [
      {
        ...state,
        isNavigating: true,
        items: [],
        poppingEntry: activeScreen,
      },
      undefined,
    ];
  }

  const newActiveScreen = state.items[newActiveScreenIdx];
  const newItems = state.items.slice(0, newActiveScreenIdx + 1);

  if (newActiveScreen) {
    // Setting pop extras
    newItems[newItems.length - 1] = {
      ...newActiveScreen,
      originalScreenEl: RoutingState.cloneElement(
        newActiveScreen.originalScreenEl,
        {
          popExtras: options?.popExtras || undefined,
        } as PopExtrasProps<object>
      ),
    };
  }

  return [
    {
      ...state,
      isNavigating: true,
      poppingEntry: {
        key: activeScreen.key,
        originalScreenEl: activeScreen.originalScreenEl,
      },
      items: newItems,
    },
    undefined,
  ];
};

export const screenEntered = (
  state: State,
  opts: ClearHistoryOptions | undefined
): [State, ScreenEnteredError | undefined] => {
  const clearedItems = state.items.filter(
    (it, idx) => !(idx !== state.items.length - 1 && it.keepInHistory === false)
  );

  // Remove items which are not supposed to be kept in history
  // We do it here to let animation finish
  const cleanupItems = (st: State): State => {
    return {
      ...st,
      items: st.items.filter(
        (it, idx) =>
          !(idx !== st.items.length - 1 && it.keepInHistory === false)
      ),
    };
  };

  const [newSt, error] = clearHistory(state, opts);

  if (error) {
    return [{ ...newSt, isNavigating: false }, error];
  }

  if (state.queuedItems.length > 0) {
    const queuedEntry = state.queuedItems[0];
    const queuedItems = state.queuedItems.slice(1);
    return [
      {
        ...state,
        isNavigating: true,
        queuedItems: queuedItems,
        items: [...clearedItems, queuedEntry],
      },
      undefined,
    ];
  }

  return [
    {
      ...cleanupItems(newSt),
      isNavigating: false,
    },
    undefined,
  ];
};

export const screenExited = (st: State): State => {
  return {
    ...st,
    isNavigating: false,
    poppingEntry: undefined,
  };
};

const clearHistory = (
  st: State,
  opts: ClearHistoryOptions | undefined
): [State, ClearHistoryError | undefined] => {
  if (!opts) {
    return [st, undefined];
  }

  const screenIndex = st.items.findIndex(entry => entry.key === opts.untilKey);

  if (screenIndex < 0) {
    return [st, { type: 'ClearHistoryUntilNotFound', key: opts.untilKey }];
  }

  const items = compact([
    ...st.items.slice(0, screenIndex + (opts.including ? 0 : 1)),
    last(st.items),
  ]);

  return [
    {
      ...st,
      items: items,
    },
    undefined,
  ];
};

//#region errors

export type NavigationInProgressError = { type: 'NavigationInProgress' };
export const navigationInProgressError: NavigationInProgressError = {
  type: 'NavigationInProgress',
};

export type PushError =
  | NavigationInProgressError
  | { type: 'DuplicateKeyFound'; key: string };

export type NewScreenNotFoundError = { type: 'NewScreenNotFound' };
export const newScreenNotFoundError: NewScreenNotFoundError = {
  type: 'NewScreenNotFound',
};
export type PopError =
  | NavigationInProgressError
  | NewScreenNotFoundError
  | { type: 'NoActiveScreen' };

export type ClearHistoryError = {
  type: 'ClearHistoryUntilNotFound';
  key: string;
};
export type ScreenEnteredError = ClearHistoryError;
//#endregion
