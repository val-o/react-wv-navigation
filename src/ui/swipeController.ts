import { FullGestureState } from 'react-use-gesture/dist/types';

type ISwipeLitener = (props: FullGestureState<'drag'>) => void;

export const makeSwipeController = () => {
  let listeners: ISwipeLitener[] = [];

  return {
    listenSwipe: (listener: ISwipeLitener) => {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
    pushState: (state: FullGestureState<'drag'>) => {
      listeners.forEach((l) => l(state));
    },
  };
};

export type ISwipeController = ReturnType<typeof makeSwipeController>;
