import { compact, last, useLazyRef } from '../utils';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useLatest } from 'react-use';
import { PanelAnimation } from '../components/PanelAnimation';
import { makeSwipeController } from '../components/swipeController';
import {
  IClearHistoryOptions,
  IHistoryEntry,
  IPopOptions,
  IPushOptions,
  IRouter,
  IPopExtrasProps,
} from './types';

export const MemoryRouter: React.FC<{
  controls?: IRouter;
  initialState?: IHistoryEntry[];
  zIndex?: number;
}> = ({ initialState, children, zIndex, controls }) => {
  const isRenderedRef = useRef(false);

  const logger = { debug: console.log };
  const [items, setItems] = useState(initialState ? initialState : []);
  const itemsRef = useLatest(items);
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useLatest(isNavigating);
  const clearHistoryOptions = useRef<IClearHistoryOptions>();
  const [poppingEntry, setPoppingEntry] = useState<IHistoryEntry | undefined>();
  const swipeController = useLazyRef(makeSwipeController).current;

  useEffect(() => {
    const keys = items.map(s => s.key).join(',');
    logger.debug(`[Router] Router state [${keys}]`, items);
  }, [items, logger]);

  const pushScreen = useLazyRef(() => (options: IPushOptions) => {
    logger.debug(`[Router] Pushing screen with key ${options.key}`);
    if (isNavigatingRef.current) {
      logger.debug(
        '[Navigation] Trying to navigate in the middle of previous navigation'
      );
      return;
    }

    // if (options.clearHistory) {
    //   clearHistoryOptions.current = options.clearHistory;
    // }

    setIsNavigating(true);
    const newItems = [
      ...itemsRef.current,
      {
        key: options.key,
        originalScreenEl: options.screen,
        keepInHistory: options.keepInHistory,
      },
    ];

    setItems(newItems);
  });

  const popScreen = useLazyRef(() => (options?: IPopOptions) => {
    logger.debug(`[Router] Start popping screen`);
    if (isNavigatingRef.current) {
      logger.debug(
        '[Navigation] Trying to navigate in the middle of previous navigation'
      );
      return;
    }

    const activeScreen = last(itemsRef.current)!;
    let newActiveScreenIdx = itemsRef.current.length - 2;

    if (options?.toScreen) {
      newActiveScreenIdx = itemsRef.current.findIndex(
        e => e.key === options.toScreen
      );
      // Exit if no screen has been found
      if (newActiveScreenIdx < 0) {
        return;
      }
      if (options.including) {
        newActiveScreenIdx -= 1;
      }
      if (newActiveScreenIdx === itemsRef.current.length - 1) {
        return;
      }
    }

    ReactDOM.unstable_batchedUpdates(() => {
      setIsNavigating(true);

      logger.debug(`[Router] Popping screen with key ${activeScreen.key}`);
      setPoppingEntry({
        key: activeScreen.key,
        originalScreenEl: activeScreen.originalScreenEl,
      });

      const newActiveScreen = itemsRef.current[newActiveScreenIdx];

      const newItems = itemsRef.current.slice(0, newActiveScreenIdx + 1);
      if (newActiveScreen) {
        newItems[newItems.length - 1] = {
          ...newActiveScreen,
          originalScreenEl: React.cloneElement(
            newActiveScreen.originalScreenEl,
            {
              popExtras: options?.popExtras || {},
            } as IPopExtrasProps<object>
          ),
        };
      }
      setItems(newItems);
    });
  });

  const handleEnteredScreen = useLazyRef(() => () => {
    setIsNavigating(false);
    if (clearHistoryOptions.current) {
      const opts = clearHistoryOptions.current;
      clearHistoryOptions.current = undefined;
      const screenIndex = itemsRef.current.findIndex(
        entry => entry.key === opts.untilKey
      );
      if (screenIndex < 0) {
        logger.debug(
          `[Router] Couldn't find screen with key ${opts.untilKey} for clearing, doing nothing`
        );
        return;
      }
      setItems(
        compact([
          ...itemsRef.current.slice(0, screenIndex + (opts.including ? 0 : 1)),
          last(itemsRef.current),
        ])
      );
    }
    setItems(items =>
      items.filter(
        (it, idx) => !(idx !== items.length - 1 && it.keepInHistory === false)
      )
    );
  }).current;

  const contextValue: IRouter = useRef({
    popScreen: popScreen.current,
    markToClearHistoryUntil: (options: IClearHistoryOptions) => {
      clearHistoryOptions.current = options;
    },
    pushScreen: pushScreen.current,
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
      {items.length || poppingEntry ? (
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
          {isNavigating && (
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
          {items
            .map((it, idx, arr) => {
              return (
                <PanelAnimation
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
                </PanelAnimation>
              );
            })
            .concat(
              poppingEntry ? (
                <PanelAnimation
                  swipeController={swipeController}
                  canGoBack={false}
                  state={'popped'}
                  panelId={poppingEntry.key}
                  key={poppingEntry.key}
                  onAnimationDone={() => {
                    setIsNavigating(false);
                    setPoppingEntry(undefined);
                  }}
                >
                  {poppingEntry.originalScreenEl}
                </PanelAnimation>
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
