import React from 'react';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    boxShadow: `0px 0px 20px 20px ${theme.palette.background.default}`,
  },
  rootTop: {
    top: 0,
  },
  rootBottom: {
    bottom: 0,
  },
}));

interface IProps {
  position?: 'top' | 'bottom';
}
export const ShadowHolder: React.FC<IProps> = (props) => {
  const { position = 'top' } = props;
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.root,
        position === 'bottom' && classes.rootBottom,
        position === 'top' && classes.rootTop
      )}
    ></div>
  );
};
