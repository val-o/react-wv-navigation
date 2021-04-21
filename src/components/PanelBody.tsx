import { Box, BoxProps, makeStyles } from '@material-ui/core';
import React, { useCallback, useContext, useRef } from 'react';
import { SAFE_INSETS_BOTTOM, SAFE_INSETS_TOP } from './constants';
import { PANEL_HEADER_HEIGHT } from './constants';
import { PanelContext } from './PanelContext';
const useStyles = makeStyles(theme => ({
  root: {},
}));

export interface PanelBodyProps extends BoxProps {
  noHeaderPadding?: boolean;
  rootRef?: React.MutableRefObject<HTMLDivElement>;
  containerBoxProps?: BoxProps;
}
export const PanelBody: React.FC<PanelBodyProps> = props => {
  const { noHeaderPadding, rootRef, containerBoxProps, ...boxProps } = props;
  const boxRef = useRef<HTMLDivElement>();
  const classes = useStyles();

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

  // useEvent because we need to listen passively
  // useEvent('scroll', handleScroll, boxRef.current, { passive: true });

  /**
   * Nested containers done for androids, На андроидах автоматом скукоживаются флексы,
   * поэтому обернули в нескукожеваумый контейнер
   */
  return (
    // Scrollable container
    <Box
      data-panel
      flex="1 1 auto"
      display="flex"
      flexDirection="column"
      {...boxProps}
      style={{ overflowY: 'auto', ...boxProps.style }}
      onScroll={handleScroll}
      pb={SAFE_INSETS_BOTTOM}
    >
      {/* Body that might overflow */}
      <Box
        data-panel-inner
        flex="1 0 auto"
        display="flex"
        flexDirection="column"
        style={{ overflow: 'hidden' }}
        pl={3}
        pr={3}
        {...containerBoxProps}
      >
        {/* PanelHeader Placeholder */}
        {!noHeaderPadding && (
          <Box width="100%" flex="0 0 auto" height={PANEL_HEADER_HEIGHT}></Box>
        )}
        {props.children}
      </Box>
    </Box>
  );
};
