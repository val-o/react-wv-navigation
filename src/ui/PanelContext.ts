import React, { useContext, useEffect } from 'react';
import { Observable, Subject } from 'rxjs';
import { PanelState } from './types';

export interface IPanelStateChangeArgs {
  currentState: PanelState;
  previousState: PanelState | undefined;
}

export type PanelScrollState = 'top' | 'interim';

export interface PanelContextValue {
  setSwipeBackHandler: (handler: (() => void) | undefined) => void;
  panelBodyScroll$: Subject<PanelScrollState>;
  /**
   * Userful when there is a guard on going back, so if user rejects going back you can move panel back by using this method
   */
  cancelSwipe: () => void;
  panelStateChange$: Observable<IPanelStateChangeArgs>;
}

export const PanelContext = React.createContext<PanelContextValue>({} as any);
export const usePanelContext = () => useContext(PanelContext);
