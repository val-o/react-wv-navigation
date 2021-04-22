import { useEffect } from 'react';
import { usePanelContext } from './PanelContext';

export const useSwipeBack = (action: () => void | undefined) => {
  const panelContext = usePanelContext();

  useEffect(() => {
    if (action) {
      panelContext.setSwipeBackHandler(action);
    }
  }, [panelContext.setSwipeBackHandler, action, panelContext]);
};
