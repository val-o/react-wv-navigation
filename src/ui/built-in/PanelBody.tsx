import React, { useCallback, useContext, useRef } from 'react';
import { SAFE_INSETS_BOTTOM, SAFE_INSETS_TOP } from '../constants';
import { PANEL_HEADER_HEIGHT } from '../constants';
import { useScrollState } from '../useScrollState';

const rootStyles: React.CSSProperties = {
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  paddingBottom: SAFE_INSETS_BOTTOM,
  background: 'white',
};

const containerStyles: React.CSSProperties = {
  flex: '1 0 auto',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  paddingLeft: 3,
  paddingRight: 3,
};

const headerPlhStyles: React.CSSProperties = {
  width: '100%',
  flex: '0 0 auto',
  height: PANEL_HEADER_HEIGHT,
};

export interface PanelBodyProps {
  noHeaderPadding?: boolean;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}
export const PanelBody: React.FC<PanelBodyProps> = props => {
  const { noHeaderPadding, style, containerStyle } = props;

  const scrollableProps = useScrollState();

  /**
   * Nested containers done for androids, На андроидах автоматом скукоживаются флексы,
   * поэтому обернули в нескукожеваумый контейнер
   */
  return (
    // Scrollable container
    <div {...scrollableProps} data-panel style={{ ...rootStyles, ...style }}>
      {/* Body that might overflow */}
      <div data-panel-inner style={{ ...containerStyles, ...containerStyle }}>
        {/* PanelHeader Placeholder */}
        {!noHeaderPadding && <div style={headerPlhStyles}></div>}
        {props.children}
      </div>
    </div>
  );
};
