import { FullGestureState } from 'react-use-gesture/dist/types';

type SwipeLitener = (props: FullGestureState<'drag'>) => void;

export const makeSwipeController = () => {
  let listeners: SwipeLitener[] = [];

  return {
    listenSwipe: (listener: SwipeLitener) => {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
    pushState: (state: FullGestureState<'drag'>) => {
      listeners.forEach(l => l(state));
    },
  };
};

export type SwipeController = ReturnType<typeof makeSwipeController>;
