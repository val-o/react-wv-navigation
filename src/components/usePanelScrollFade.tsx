import React, { useCallback, useContext } from 'react';
import { PanelContext } from './PanelContext';

export const usePanelScrollFade = (): Pick<
  React.HTMLAttributes<HTMLElement>,
  'onScroll'
> => {
  const panelContext = useContext(PanelContext);
  const handleScroll = useCallback(
    (ev: React.UIEvent<HTMLElement, UIEvent>) => {
      const div = ev.target as HTMLDivElement;
      if (div.scrollTop === 0) {
        panelContext.panelBodyScroll$.next('top');
      } else {
        panelContext.panelBodyScroll$.next('interim');
      }
    },
    [panelContext.panelBodyScroll$]
  );

  return {
    onScroll: handleScroll,
  };
};
