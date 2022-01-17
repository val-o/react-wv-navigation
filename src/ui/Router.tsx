import React, { useEffect, useState } from 'react';
import { RouterController } from '../core/RouterController';
import { useLazyRef } from '../utils';
import { RouterContext } from './RouterContext';
import { makeSwipeController } from './swipeController';
import { Panel } from './transitions/Panel';

type RouterProps = {
  controller: RouterController;
  zIndex: number;
};

export const Router: React.FC<RouterProps> = ({
  children,
  zIndex,
  controller,
}) => {
  const swipeController = useLazyRef(makeSwipeController).current;

  const [routerState, setRouterState] = useState(controller.routerState);

  useEffect(() => {
    const subs = controller.routerState$.subscribe(setRouterState);

    return () => subs.unsubscribe();
  }, [controller]);

  const screenEls = routerState.items.map((it, idx, items) => {
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
        onEntered={controller.onScreenEntered}
      >
        {it.originalScreenEl}
      </Panel>
    );
  });

  return (
    <RouterContext.Provider value={controller}>
      {/*
        Завернуто в массив , тк реакт начинает странно себя вести(пропадает стейт панелек который далеко в истории) если вставлять обычными чайлдами
      */}
      {routerState.items.length || routerState.poppingEntry ? (
        <div
          style={{
            ...rootStyles,
            zIndex: zIndex,
          }}
        >
          {/* We show overlay to prevent clicks on animating panels */}
          {routerState.isNavigating && overlayEl}
          {screenEls.concat(
            routerState.poppingEntry ? (
              <Panel
                swipeController={swipeController}
                canGoBack={false}
                state={'popped'}
                panelId={routerState.poppingEntry.key}
                key={routerState.poppingEntry.key}
                onExited={controller.onScreenExited}
              >
                {routerState.poppingEntry.originalScreenEl}
              </Panel>
            ) : (
              []
            )
          )}
        </div>
      ) : null}
      {children}
    </RouterContext.Provider>
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
