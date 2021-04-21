import { Box, IconButton, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { noop } from '../utils';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLatest } from 'react-use';
import { asyncScheduler, Subscription } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { usePanelContext } from './PanelContext';
import { ShadowHolder } from './ShadowHolder';
// import { useAndroidBackButton } from 'modules/platform/hooks';
import { PANEL_HEADER_HEIGHT, SAFE_INSETS_TOP } from './constants';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    zIndex: theme.zIndex.appBar,
    right: 0,
    left: 0,
    top: SAFE_INSETS_TOP,
    paddingLeft: 4,
    paddingRight: theme.spacing(2),
    // background: `linear-gradient(0deg, transparent 30%, ${theme.palette.background.default} 100%)`,
    height: PANEL_HEADER_HEIGHT,
    display: 'flex',
    flex: '0 0 auto',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionIcon: {
    color: theme.palette.text.primary,
  },
}));

interface IProps {
  leftAction?: IHeaderAction;
  onLeftAction?: () => void | Promise<void>;
  rightAction?: IHeaderAction;
  onRightAction?: () => void | Promise<void>;
  inModal?: boolean;
}
export const PanelHeader: React.FC<IProps> = props => {
  const {
    leftAction,
    onLeftAction,
    rightAction,
    onRightAction,
    inModal,
  } = props;
  const propsRef = useLatest(props);
  const classes = useStyles();
  const [scrolled, setScrolled] = useState(false);

  const panelContext = usePanelContext();
  // const { addBackButtonListener } = useAndroidBackButton();

  useEffect(() => {
    if (inModal) {
      return;
    }
    const subs: Subscription[] = [
      panelContext.panelBodyScroll$
        .pipe(observeOn(asyncScheduler))
        .subscribe(val => {
          setScrolled(val === 'interim');
        }),
    ];

    return () => subs.forEach(s => s.unsubscribe());
  }, [inModal, panelContext.panelBodyScroll$, propsRef]);

  // Handling swipe back
  useEffect(() => {
    panelContext.setSwipeBackHandler(onLeftAction);
  }, [panelContext.setSwipeBackHandler, onLeftAction, panelContext]);

  // useEffect(() => {
  //   const unlisten = addBackButtonListener(() => {
  //     if (propsRef.current.onLeftAction) {
  //       propsRef.current.onLeftAction?.();
  //     }
  //   });
  //   return () => {
  //     unlisten();
  //   };
  // }, [addBackButtonListener, propsRef]);

  useEffect(() => {}, []);

  const handleLeftClick = useCallback(() => {
    onLeftAction?.();
  }, [onLeftAction]);

  const renderLeftContent = () => {
    if (!leftAction) {
      return null;
    }

    return (
      <Box mr={4} data-testid="back-button">
        <IconButton onClick={handleLeftClick}>
          <div>back</div>;
        </IconButton>
      </Box>
    );
  };

  const renderRightContent = () => {
    if (!rightAction) {
      return null;
    }

    return (
      <Box ml={4} alignSelf="flex-end">
        <IconButton onClick={onRightAction ?? noop}>
          <div>back</div>;
        </IconButton>
      </Box>
    );
  };

  return (
    <>
      <Box className={clsx(classes.root)} data-testid="panel-header">
        <ShadowHolder position="top" />
        {renderLeftContent()}
        {renderRightContent()}
      </Box>
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
