import { useEffect } from 'react';
import { usePanelContext } from './PanelContext';
import { PanelState } from './types';

type StrictExclude<T, U extends T> = T extends U ? never : T;

type EventListeners = {
  onBecomeActive: (previousState: PanelState) => void;
  
}

export const usePanelStateEvents = ({
  onBecomeActive,
}: {
  onBecomeActive?: (
    previousState: StrictExclude<PanelState, 'active'> | undefined
  ) => void;
}) => {
  const ctx = usePanelContext();
  useEffect(() => {
    const sub = ctx.panelStateChange$.subscribe(
      ({ currentState, previousState }) => {
        if (currentState === 'active') {
          onBecomeActive?.(
            previousState as StrictExclude<PanelState, 'active'> | undefined
          );
        }
      }
    );
    return () => sub.unsubscribe();
  });
};
