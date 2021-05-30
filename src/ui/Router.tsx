import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Panel } from './transitions/Panel';
import { makeSwipeController } from './swipeController';
import { styledLogMessage, useLazyRef } from '../utils';
import * as RouterState from '../core/RouterState';
import { RouterController } from './types';
import { useLogger } from './useLogger';
import { useOptionsContext } from '../WVNavigationProvider';
import { useRouting, useRoutingContext } from './RoutingContext';
import { useLatest } from 'react-use';

export const Router: React.FC<{
  id: string;
  controls?: RouterController;
  initialState?: RouterState.HistoryEntry[];
  zIndex: number;
  isActive: boolean;
}> = ({ initialState, children, zIndex, isActive, controls, id }) => {
  const isRenderedRef = useRef(false);

  const log = useLogger();
  const {} = useOptionsContext();
  const routingCtx = useRoutingContext();
  const clearHistoryOptions = useRef<RouterState.ClearHistoryOptions>();
  const swipeController = useLazyRef(makeSwipeController).current;

  const [[state, error], setState] = useState<
    [RouterState.State, Error | undefined]
  >(() => [RouterState.create(initialState), undefined]);
  const stateRef = useLatest(state);

  useEffect(() => {
    const keys = state.items.map(s => s.key).join(',');
    log(...styledLogMessage(`Router[${id}] state [${keys}]`), state);
  }, [state]);

  const reportError = useCallback((error: Error | undefined) => {
    if (!error) {
      return;
    }
    log(...getErrorMessage(error));
  }, []);

  useEffect(() => {
    reportError(error);
  }, [error]);

  const pushScreen = useCallback(
    (options: RouterState.PushOptions & { bringToFront: boolean }) => {
      log(
        ...styledLogMessage(
          `Router[${id}] Pushing screen with key ${options.key}`
        )
      );
      setState(([st]) => RouterState.pushScreen(st, options));
      if (options.bringToFront !== false) {
        routingCtx.bringToFront(id);
      }
    },
    []
  );

  const popScreen = useCallback((options?: RouterState.PopOptions) => {
    log(...styledLogMessage(`Router[${id}] Start popping active screen`));
    const newState = RouterState.popScreen(stateRef.current, options);
    setState(newState);
  }, []);

  const handleEnteredScreen = useCallback(() => {
    setState(([st]) =>
      RouterState.screenEntered(st, clearHistoryOptions.current)
    );
    clearHistoryOptions.current = undefined;
  }, []);

  const handleScreenExited = useCallback(() => {
    const newState = RouterState.screenExited(stateRef.current);
    setState(() => [newState, undefined]);
    if (newState.items.length === 0) {
      routingCtx.exitRouter(id);
    }
  }, []);

  const contextValue: RouterController = useRef({
    popScreen: popScreen,
    markToClearHistoryUntil: (options: RouterState.ClearHistoryOptions) => {
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

  const screenEls = state.items.map((it, idx, items) => {
    return (
      <Panel
        swipeController={swipeController}
        panelId={it.key}
        canGoBack={idx === items.length - 1 && items.length > 1}
        state={
          idx === items.length - 1
            ? 'active'
            : idx === items.length - 2
            ? 'background'
            : 'none'
        }
        key={it.key}
        onAnimationDone={handleEnteredScreen}
      >
        {it.originalScreenEl}
      </Panel>
    );
  });

  return (
    <>
      {/*
        Завернуто в массив , тк реакт начинает странно себя вести(пропадает стейт панелек который далеко в истории) если вставлять обычными чайлдами
      */}
      {state.items.length || state.poppingEntry ? (
        <div
          style={{
            ...rootStyles,
            zIndex: isActive ? zIndex : 0,
            // opacity: isActive ? 1 : 0,
          }}
        >
          {/* We show overlay to prevent clicks on animating panels */}
          {state.isNavigating && overlayEl}
          {screenEls.concat(
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

const rootStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  overflowX: 'hidden',
  top: 0,
  left: 0,
  position: 'absolute',
  transition: `opacity .15s ease-in`,
};

const overlayStyles: React.CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: 100,
  background: 'transaprent',
};
const overlayEl = <div style={overlayStyles}></div>;

type Error =
  | RouterState.PopError
  | RouterState.PushError
  | RouterState.ClearHistoryError
  | RouterState.ScreenEnteredError;

const getErrorMessage = (
  error:
    | RouterState.PopError
    | RouterState.PushError
    | RouterState.ClearHistoryError
    | RouterState.ScreenEnteredError
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
    case 'DuplicateKeyFound': {
      return styledLogMessage(
        `Trying to push screen with non-unique key: ${error.key}`
      );
    }
  }
};
