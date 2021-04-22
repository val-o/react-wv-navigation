import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Panel } from '../components/Panel';
import { makeSwipeController } from '../components/swipeController';
import { useLazyRef } from '../utils';
import * as RoutingS from './RoutingState';
import { IRouter } from './types';

const styledLogMessage = (message: string) => [
  `%c [🤙🏻 Routing] ${message}`,
  'display: inline-block ; background-color: darkblue ; color: #ffffff ; font-weight: bold ; padding: 2px 2px 2px 2px ; border-radius: 3px',
  '',
];

const getErrorMessage = (
  error:
    | RoutingS.PopError
    | RoutingS.PushError
    | RoutingS.ClearHistoryError
    | RoutingS.ScreenEnteredError
): string[] => {
  switch (error.type) {
    case 'NavigationInProgress': {
      return styledLogMessage(
        `Trying to navigate while navigation is in progress. Doing nothing...`
      );
    }
    case 'NewScreenNotFound': {
      return styledLogMessage(`Screen wasn't found during poping`);
    }
    case 'NoActiveScreen': {
      return styledLogMessage(
        `Cannot pop as there is no screens before active`
      );
    }
    case 'ClearHistoryUntilNotFound': {
      return styledLogMessage(
        `Couldn't find screen with key ${error.key} for clearing, doing nothing`
      );
    }
  }
};

type Error =
  | RoutingS.PopError
  | RoutingS.PushError
  | RoutingS.ClearHistoryError
  | RoutingS.ScreenEnteredError;

export const MemoryRouter: React.FC<{
  controls?: IRouter;
  initialState?: RoutingS.HistoryEntry[];
  zIndex?: number;
}> = ({ initialState, children, zIndex, controls }) => {
  const isRenderedRef = useRef(false);

  const logger = { debug: console.log };
  const clearHistoryOptions = useRef<RoutingS.ClearHistoryOptions>();
  const swipeController = useLazyRef(makeSwipeController).current;

  const [[state, error], setState] = useState<
    [RoutingS.State, Error | undefined]
  >(() => [RoutingS.create(initialState), undefined]);

  useEffect(() => {
    const keys = state.items.map(s => s.key).join(',');
    logger.debug(...styledLogMessage(`Router state [${keys}]`), state.items);
  }, [state.items, logger]);

  const reportError = useCallback((error: Error | undefined) => {
    if (!error) {
      return;
    }
    console.log(...getErrorMessage(error));
  }, []);

  useEffect(() => {
    reportError(error);
  }, [error]);

  const pushScreen = useCallback((options: RoutingS.PushOptions) => {
    console.log(...styledLogMessage(`Pushing screen with key ${options.key}`));
    setState(([st]) => RoutingS.pushScreen(st, options));
  }, []);

  const popScreen = useCallback((options?: RoutingS.PopOptions) => {
    console.log(...styledLogMessage(`Start popping active screen`));
    setState(([st]) => RoutingS.popScreen(st, options));
  }, []);

  const handleEnteredScreen = useCallback(
    () =>
      setState(([st]) =>
        RoutingS.screenEntered(st, clearHistoryOptions.current)
      ),
    []
  );

  const handleScreenExited = useCallback(
    () => setState(([st]) => [RoutingS.screenExited(st), undefined]),
    []
  );

  const contextValue: IRouter = useRef({
    popScreen: popScreen,
    markToClearHistoryUntil: (options: RoutingS.ClearHistoryOptions) => {
      clearHistoryOptions.current = options;
    },
    pushScreen: pushScreen,
  }).current;

  if (!isRenderedRef.current) {
    // This is not idiomatic react piece of code.
    if (controls) {
      controls.markToClearHistoryUntil = contextValue.markToClearHistoryUntil;
      controls.popScreen = contextValue.popScreen;
      controls.pushScreen = contextValue.pushScreen;
    }
    isRenderedRef.current = true;
  }

  return (
    <>
      {/*
        Завернуто в массив , тк реакт начинает странно себя вести(пропадает стейт панелек который далеко в истории) если вставлять обычными чайлдами
      */}
      {state.items.length || state.poppingEntry ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            overflowX: 'hidden',
            top: 0,
            left: 0,
            position: 'absolute',
            zIndex: zIndex,
          }}
        >
          {state.isNavigating && (
            // We show overlay to prevent clicks on animating panels
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                zIndex: 100,
                background: 'transaprent',
              }}
            ></div>
          )}
          {state.items
            .map((it, idx, arr) => {
              return (
                <Panel
                  swipeController={swipeController}
                  panelId={it.key}
                  canGoBack={idx === arr.length - 1 && arr.length > 1}
                  state={
                    idx === arr.length - 1
                      ? 'active'
                      : idx === arr.length - 2
                      ? 'background'
                      : 'none'
                  }
                  key={it.key}
                  onAnimationDone={handleEnteredScreen}
                >
                  {it.originalScreenEl}
                </Panel>
              );
            })
            .concat(
              state.poppingEntry ? (
                <Panel
                  swipeController={swipeController}
                  canGoBack={false}
                  state={'popped'}
                  panelId={state.poppingEntry.key}
                  key={state.poppingEntry.key}
                  onAnimationDone={handleScreenExited}
                >
                  {state.poppingEntry.originalScreenEl}
                </Panel>
              ) : (
                []
              )
            )}
        </div>
      ) : null}
      {children}
    </>
  );
};
