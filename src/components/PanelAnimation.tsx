import { makeStyles } from '@material-ui/core';
import { useLazyRef } from '../utils';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { animated, SpringConfig, to, useSpring } from 'react-spring';
import { useLatest, useMount, usePreviousDistinct } from 'react-use';
import { useDrag } from 'react-use-gesture';
import { Subject } from 'rxjs';
import { SAFE_INSETS_TOP } from './constants';
import {
  PanelContextValue,
  IPanelStateChangeArgs,
  PanelContext,
} from './PanelContext';
import { ISwipeController } from './swipeController';
import { PanelState } from './types';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflowY: 'hidden',
    background: theme.palette.background.default,
    boxShadow: `0px 3px 16px rgba(0, 0, 0, 0.09)`,
  },
}));

const getOverlayedX = () => -window.innerWidth / 2;

const SPRING_CONFIG: SpringConfig = {
  mass: 1,
  tension: 220,
  clamp: true,
  friction: 20,
  duration: 190,
};

export interface IPanelAnimationProps {
  // For debugging purposes
  appearAnimation?: 'bottom-top' | 'right-left';
  panelId: string;
  state: PanelState;
  onAnimationDone: () => void;
  // onExited: () => void;
  // onOverlayed: () => void;
  // onEntered: () => void;
  canGoBack: boolean;
  swipeController: ISwipeController;
}
export const PanelAnimation: React.FC<IPanelAnimationProps> = props => {
  // const [panelState] = useState();
  const {
    state: pstate,
    swipeController,
    appearAnimation = 'right-left',
  } = props;
  const propsRef = useLatest(props);
  const classes = useStyles();
  const cancelDragRef = useRef<() => void>();
  const isAnimating = useRef(true);
  const previousState = usePreviousDistinct(pstate);

  const [swipeBackHandler, setSwipeBackHandler] = useState<{
    handler: (() => void) | undefined;
  }>({
    handler: undefined,
  });
  const panelStateChangeSubject = useLazyRef(
    () => new Subject<IPanelStateChangeArgs>()
  ).current;

  const [sprops, set] = useSpring(() => {
    let initialX = 0;
    let initialY = 0;
    let initialOpacity = 0;
    let initialScale = 1;

    if (pstate === 'active') {
      if (appearAnimation === 'right-left') {
        initialX = window.innerWidth;
      }
      if (appearAnimation === 'bottom-top') {
        initialY = window.innerHeight;
      }
      initialOpacity = 0;
    }

    if (pstate === 'background') {
      initialX = getOverlayedX();
      initialOpacity = 1;
    }

    return {
      x: initialX,
      y: initialY,
      scale: initialScale,
      opacity: initialOpacity,
      config: SPRING_CONFIG,
    };
  });

  // Активная панелька
  const bind = useDrag(
    state => {
      const {
        down,
        movement: [mx],
        cancel,
        canceled,
      } = state;
      if (isAnimating.current) {
        return;
      }
      cancelDragRef.current = cancel;
      swipeController.pushState(state);

      if (canceled) {
        set({
          x: 0,
          config: { mass: 1, tension: 400, clamp: true, friction: 20 },
        });
        return;
      }

      // Отменям если начинает свайпать в обратную сторону
      if (mx < 0) {
        cancel?.();
        return;
      }

      set({
        x: mx,
        immediate: false,
        config: { mass: 1, tension: 400, clamp: true, friction: 20 },
        onRest: () => {},
      });

      if (!down) {
        // Если драгнул больше чем на половину и отпустил
        if (mx > window.innerWidth / 2) {
          swipeBackHandler.handler?.();
          return;
        } else {
          cancel?.();
          return;
        }
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

  // Пассивная панель
  useEffect(() => {
    if (pstate === 'active' || pstate === 'none') {
      return;
    }
    const release = swipeController.listenSwipe(state => {
      if (propsRef.current.state === 'background') {
        const {
          canceled,
          movement: [mx],
        } = state;

        set({
          x: !canceled ? getOverlayedX() + mx / 2 : getOverlayedX(),
          config: { mass: 1, tension: 400, clamp: true, friction: 20 },
          onRest: () => {},
        });
      }
    });
    return release;
  }, [propsRef, pstate, set, swipeController]);

  useMount(() => {
    console.log('Panelid ' + props.panelId);
  });

  useEffect(() => {
    setTimeout(() => {
      if (
        pstate === 'active' &&
        (previousState === undefined ||
          previousState === 'background' ||
          previousState === 'none')
      ) {
        isAnimating.current = true;
        set({
          x: 0,
          y: 0,
          opacity: 1,
          config: SPRING_CONFIG,
          onRest: {
            x: () => {
              isAnimating.current = false;
              propsRef.current.onAnimationDone();
              panelStateChangeSubject.next({
                currentState: pstate,
                previousState,
              });
            },
          },
        });
      }
      if (pstate === 'popped') {
        set({
          x: +window.innerWidth,
          opacity: 1,

          config: SPRING_CONFIG,
          onRest: {
            x: () => {
              propsRef.current.onAnimationDone();
              panelStateChangeSubject.next({
                currentState: pstate,
                previousState,
              });
            },
          },
        });
      }
      if (pstate === 'background' && previousState === 'active') {
        set({
          x: getOverlayedX(),
          scale: 1,
          opacity: 1,
          config: SPRING_CONFIG,
          onRest: {
            x: () => {
              propsRef.current.onAnimationDone();
              panelStateChangeSubject.next({
                currentState: pstate,
                previousState,
              });
            },
          },
        });
      }
    });
  }, [panelStateChangeSubject, previousState, propsRef, pstate, set]);

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
        <animated.div
          key="1"
          style={{
            display: 'none',
          }}
        >
          {props.children}
        </animated.div>
      ) : (
        <animated.div
          {...bind()}
          key="1"
          style={{
            // TODO: Remove as any
            zIndex: (pstate === 'background' ? 0 : 10) as any,
            transform: to(
              [sprops.x, sprops.y, sprops.scale],
              (x, y, scale) => `translate3d(${x}px,${y}px,0) scale(${scale})`
            ),
            opacity: sprops.opacity as any,
            paddingTop: SAFE_INSETS_TOP,
          }}
          className={classes.root}
        >
          {props.children}
        </animated.div>
      )}
    </PanelContext.Provider>
  );
};
