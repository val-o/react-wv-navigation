import React from 'react';

const rootStyles: React.CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  left: 0,
  right: 0,
  boxShadow: `0px 0px 20px 20px black`,
};

interface ShadowHolderProps {
  position?: 'top' | 'bottom';
}
export const ShadowHolder: React.FC<ShadowHolderProps> = props => {
  const { position = 'top' } = props;
  return (
    <div
      style={{
        ...rootStyles,
        ...(position === 'bottom'
          ? {
              bottom: 0,
            }
          : undefined),
        ...(position === 'top'
          ? {
              top: 0,
            }
          : undefined),
      }}
    ></div>
  );
};
