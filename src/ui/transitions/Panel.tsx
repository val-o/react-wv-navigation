import { useLazyRef, compact } from '../../utils';
import React, { useEffect, useRef, useState } from 'react';
import {
  useFirstMountState,
  useLatest,
  useMount,
  usePreviousDistinct,
  useUpdate,
} from 'react-use';
import { useDrag } from 'react-use-gesture';
import { Subject } from 'rxjs';
import { SAFE_INSETS_TOP } from '../constants';
import {
  PanelContextValue,
  IPanelStateChangeArgs,
  PanelContext,
} from '../PanelContext';
import { SwipeController } from '../swipeController';
import { PanelState } from '../types';
import { useOptionsContext } from '../../WVNavigationProvider';
import { useMemoOne as useMemo } from 'use-memo-one';

const ANIMATION_DURATION = 400;
const SWIPE_CANCEL_ANIM_DURATION = 150;
const ANIMATION_TRANSITION = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

const rootStyles: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflowY: 'hidden',
  boxShadow: `0px 3px 16px rgba(0, 0, 0, 0.09)`,
};

const getOverlayedX = () => -window.innerWidth / 2;

const getTargetX = (state: PanelState): number => {
  if (state === 'active') {
    return 0;
  }

  if (state === 'background') {
    return getOverlayedX();
  }

  if (state === 'popped') {
    return window.innerWidth;
  }

  return getOverlayedX();
};
// const getInitialX = (prevState: PanelState, state: PanelState): number => {
//   if (state === 'active') {
//     if (prevState === 'none' || prevState === 'background') {
//       return getOverlayedX();
//     }
//     if (!prevState) {
//       return window.innerWidth;
//     }
//   }

//   if (state === 'background') {
//     return 'rwvnv-horizontalLeftExit';
//   }

//   if (state === 'popped') {
//     return 'rwvnv-horizontalRightExit';
//   }

//   return undefined;
// };

export interface IPanelAnimationProps {
  // For debugging purposes
  panelId: string;
  state: PanelState;
  onAnimationDone: () => void;
  canGoBack: boolean;
  swipeController: SwipeController;
}
export const Panel: React.FC<IPanelAnimationProps> = props => {
  const {
    state: panelState,
    onAnimationDone,
    canGoBack,
    panelId,
    swipeController,
  } = props;
  const { panelOptions } = useOptionsContext();
  const propsRef = useLatest(props);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const cancelDragRef = useRef<() => void>();
  const isAnimating = useRef(true);
  const previousState = usePreviousDistinct(panelState);

  const [swipeBackHandler, setSwipeBackHandler] = useState<{
    handler: (() => void) | undefined;
  }>({
    handler: undefined,
  });

  const panelStateChangeSubject = useMemo(
    () => new Subject<IPanelStateChangeArgs>(),
    []
  );

  // Animation for state change
  useEffect(() => {
    if (!panelRef.current) {
      return;
    }
    const handleNewState = (state: PanelState) => {
      if (state !== 'none') {
        if (panelRef.current) {
          isAnimating.current = true;
          panelRef.current.style.transform = `translateX(${getTargetX(
            state
          )}px)`;
          panelRef.current.style.transition = ANIMATION_TRANSITION;
          setTimeout(() => {
            onAnimationDone();
            if (panelRef.current) {
              panelRef.current.style.transition = 'none';
              isAnimating.current = false;
            }
          }, ANIMATION_DURATION);
        }
      }
    };

    // We need to skip 1 render cycle to let initial transform styles to be applied
    setTimeout(() => {
      handleNewState(panelState);
    }, 0);
  }, [previousState, panelState]);

  // Активная панелька
  const bind = useDrag(
    state => {
      const {
        active,
        initial: [initialX],
        movement: [mx],
        cancel,
        canceled,
        tap,
      } = state;
      if (isAnimating.current || tap || initialX > 60) {
        return;
      }
      const panelEl = panelRef.current;
      if (!panelEl) {
        return;
      }
      cancelDragRef.current = cancel;
      swipeController.pushState(state);

      if (canceled) {
        cancelDragRef.current = undefined;
        panelEl.style.transition = `all ${SWIPE_CANCEL_ANIM_DURATION}ms ease-in-out`;
        panelEl.style.transform = `translateX(0px)`;
        return;
      }

      // Cancel if swipe is going in the wrong direction
      if (mx < 0) {
        cancel?.();
        return;
      }

      if (!active) {
        // Fire an event if swiped more that half and released
        if (mx > window.innerWidth / 2) {
          swipeBackHandler.handler?.();
          return;
        } else {
          cancel?.();
          return;
        }
      }

      panelEl.style.transform = `translateX(${mx}px)`;
      panelEl.style.transition = 'none';
    },
    {
      enabled: Boolean(
        panelState === 'active' && canGoBack && swipeBackHandler.handler
      ),
      filterTaps: true,
      pointer: true,
      delay: 100,
      axis: 'x',
    }
  );

  // Panel on the background
  useEffect(() => {
    const panelEl = panelRef.current;
    if (!panelEl) {
      return;
    }
    if (panelState !== 'background') {
      return;
    }
    const release = swipeController.listenSwipe(state => {
      if (propsRef.current.state === 'background') {
        const {
          canceled,
          movement: [mx],
        } = state;

        if (canceled) {
          panelEl.style.transition = `all ${SWIPE_CANCEL_ANIM_DURATION}ms ease-in-out`;
          panelEl.style.transform = `translateX(${getOverlayedX()}px)`;
        } else {
          const x = getOverlayedX() + mx / 2;
          panelEl.style.transition = `none`;
          panelEl.style.transform = `translateX(${x}px)`;
        }
      }
    });
    return release;
  }, [propsRef, panelState, swipeController]);

  const contextValue: PanelContextValue = useMemo(
    () => ({
      panelBodyScroll$: new Subject(),
      setSwipeBackHandler: handler => setSwipeBackHandler({ handler: handler }),
      cancelSwipe: () => {
        cancelDragRef.current?.();
      },
      panelStateChange$: panelStateChangeSubject,
    }),
    [panelStateChangeSubject]
  );

  return (
    <PanelContext.Provider value={contextValue}>
      {/* Чтобы повысить перфоманс и при этом дерэжать экраны в памяти, оборачиваем тем же animated.div но не показываем.
      Если обернуть обычным дивом, реакт выгрузит чилдренов - стейт потеряется */}
      {panelState === 'none' ? (
        <div
          key="1"
          ref={panelRef}
          style={{
            display: 'none',
          }}
        >
          {props.children}
        </div>
      ) : (
        <div
          {...bind()}
          key="1"
          ref={panelRef}
          style={{
            ...rootStyles,
            ...panelOptions?.style,
            zIndex: panelState === 'background' ? 0 : 10,
            paddingTop: SAFE_INSETS_TOP,
            transform: `translateX(${window.innerWidth}px)`,
          }}
        >
          {props.children}
        </div>
      )}
    </PanelContext.Provider>
  );
};
