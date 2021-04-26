import { useLazyRef, compact } from '../../utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLatest, useMount, usePreviousDistinct } from 'react-use';
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

type AppearAnimation = 'bottom-top' | 'right-left';
const ANIMATION_DURATION = 500;

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

type AnimationClass =
  | 'rwvnv-horizontalRightEnter'
  | 'rwvnv-horizontalRightExit'
  | 'rwvnv-horizontalLeftEnter'
  | 'rwvnv-horizontalLeftExit';

const getPanelClass = (
  prevState: PanelState | undefined,
  state: PanelState
): AnimationClass | undefined => {
  if (state === 'active') {
    if (prevState === 'none' || prevState === 'background') {
      return 'rwvnv-horizontalLeftEnter';
    }
    if (!prevState) {
      return 'rwvnv-horizontalRightEnter';
    }
  }

  if (state === 'background') {
    return 'rwvnv-horizontalLeftExit';
  }

  if (state === 'popped') {
    return 'rwvnv-horizontalRightExit';
  }

  return undefined;
};

export interface IPanelAnimationProps {
  appearAnimation?: AppearAnimation;
  // For debugging purposes
  panelId: string;
  state: PanelState;
  onAnimationDone: () => void;
  canGoBack: boolean;
  swipeController: SwipeController;
}
export const Panel: React.FC<IPanelAnimationProps> = props => {
  // const [panelState] = useState();
  const {
    state: pstate,
    onAnimationDone,
    swipeController,
    appearAnimation = 'right-left',
  } = props;
  const { panelOptions } = useOptionsContext();
  const propsRef = useLatest(props);
  const cancelDragRef = useRef<() => void>();
  const isAnimating = useRef(true);
  const previousState = usePreviousDistinct(pstate);
  const [swipeReached, setSwipeReached] = useState(false);

  const [swipeBackHandler, setSwipeBackHandler] = useState<{
    handler: (() => void) | undefined;
  }>({
    handler: undefined,
  });
  const panelStateChangeSubject = useLazyRef(
    () => new Subject<IPanelStateChangeArgs>()
  ).current;

  useEffect(() => {
    if (pstate !== 'none') {
      setTimeout(() => {
        onAnimationDone();
      }, ANIMATION_DURATION);
    }
  }, [pstate]);

  // Активная панелька
  const bind = useDrag(
    state => {
      const {
        active,
        movement: [mx],
        cancel,
        canceled,
      } = state;
      // if (isAnimating.current) {
      //   return;
      // }
      cancelDragRef.current = cancel;
      swipeController.pushState(state);

      if (canceled) {
        setSwipeReached(false);
        return;
      }

      // Отменям если начинает свайпать в обратную сторону
      if (mx < 0) {
        cancel?.();
        return;
      }

      if (!active) {
        // Если драгнул больше чем на половину и отпустил
        if (mx > 30) {
          swipeBackHandler.handler?.();
          setSwipeReached(false);
          return;
        } else {
          cancel?.();
          return;
        }
      }

      if (mx > 30) {
        setSwipeReached(true);
      }
    },
    {
      enabled: Boolean(
        pstate === 'active' &&
          propsRef.current.canGoBack &&
          swipeBackHandler.handler
      ),
      filterTaps: false,
      pointer: true,
      delay: 100,
    }
  );

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
      {pstate === 'none' ? (
        <div
          key="1"
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
          style={{
            ...rootStyles,
            ...panelOptions?.style,
            zIndex: pstate === 'background' ? 0 : 10,
            paddingTop: SAFE_INSETS_TOP,
            animationDuration: `${ANIMATION_DURATION}ms`,
          }}
          className={getPanelClass(previousState, pstate)}
        >
          {props.children}
        </div>
      )}
    </PanelContext.Provider>
  );
};
