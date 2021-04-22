import React from 'react';
import { PANEL_HEADER_HEIGHT, SAFE_INSETS_TOP } from '../constants';
import { ShadowHolder } from '../ShadowHolder';
import { useSwipeBack } from '../useSwipeBack';

const rootStyles: React.CSSProperties = {
  position: 'fixed',
  zIndex: 1000,
  right: 0,
  left: 0,
  top: SAFE_INSETS_TOP,
  height: PANEL_HEADER_HEIGHT,
  paddingLeft: 16,
  paddingRight: 16,
  display: 'flex',
  flex: '0 0 auto',
  alignItems: 'center',
  justifyContent: 'space-between',
};

interface IProps {
  onBack: () => void;
}
export const PanelHeader: React.FC<IProps> = props => {
  const { onBack } = props;

  useSwipeBack(onBack);

  return (
    <>
      <div style={rootStyles} data-panel-header>
        <ShadowHolder position="top" />
        {onBack && <button onClick={onBack}>Back</button>}
      </div>
    </>
  );
};

type IHeaderAction = 'back' | 'close' | 'more' | 'add';

// const ACTION_ICON_MAP: Record<
//   IHeaderAction,
//   React.ComponentType<ISvgIconProps>
// > = {
//   back: ArrowBack,
//   close: XIcon,
//   add: PlusIcon,
//   more: MoreHorizIcon,
// };
