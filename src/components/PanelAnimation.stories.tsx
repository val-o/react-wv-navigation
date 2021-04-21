import { Box } from '@material-ui/core';
import { useLazyRef, noop } from '../utils';
import React from 'react';
import { useTimeout } from 'react-use';
import { PanelAnimation } from './PanelAnimation';
import { PanelBody } from './PanelBody';
import { PanelHeader } from './PanelHeader';
import { makeSwipeController } from './swipeController';

export default {
  title: 'Routing/PanelAnimation2s',
  decorators: [],
};

const Cmp: React.FC = props => {
  return (
    <PanelBody>
      <PanelHeader onLeftAction={() => {}} leftAction="back"></PanelHeader>
      <Box>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </Box>
      <Box>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </Box>
      <Box>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </Box>
      <Box>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </Box>
      <Box>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </Box>
    </PanelBody>
  );
};

const swipeController = makeSwipeController();
export const JustActiveFromBottom = () => {
  return (
    <PanelAnimation
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={false}
      panelId="1"
      appearAnimation="bottom-top"
      state="active"
      // panelState={EPanelState.Pushing}
    >
      <Cmp />
    </PanelAnimation>
  );
};
export const JustActive = () => {
  return (
    <PanelAnimation
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={false}
      panelId="1"
      state="active"
      // panelState={EPanelState.Pushing}
    >
      <Cmp />
    </PanelAnimation>
  );
};

export const FromActiveToBackground = () => {
  const [isReady] = useTimeout(500);
  return (
    <PanelAnimation
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={false}
      panelId="1"
      state={isReady() ? 'background' : 'active'}
      // panelState={EPanelState.Pushing}
    >
      <Cmp />
    </PanelAnimation>
  );
};

export const FromActiveToPopped = () => {
  const [isReady] = useTimeout(500);
  return (
    <PanelAnimation
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={false}
      panelId="1"
      state={isReady() ? 'popped' : 'active'}
    >
      <Cmp />
    </PanelAnimation>
  );
};

export const FromBackgroundToActive = () => {
  const [isReady] = useTimeout(500);
  return (
    <PanelAnimation
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={true}
      // active={true}
      panelId="1"
      state={isReady() ? 'active' : 'background'}
      // panelState={EPanelState.Pushing}
    >
      <Cmp />
    </PanelAnimation>
  );
};

export const ActiveAndBackground = () => {
  const [isReady] = useTimeout(500);
  const swipeController = useLazyRef(makeSwipeController).current;

  return (
    <>
      <PanelAnimation
        onAnimationDone={noop}
        canGoBack={true}
        swipeController={swipeController}
        // active={true}
        panelId="1"
        state={isReady() ? 'background' : 'active'}
        // panelState={EPanelState.Pushing}
      >
        <Cmp />
      </PanelAnimation>
      {isReady() && (
        <PanelAnimation
          onAnimationDone={noop}
          canGoBack={true}
          swipeController={swipeController}
          // active={true}
          panelId="2"
          state={'active'}
          // panelState={EPanelState.Pushing}
        >
          <Cmp />
        </PanelAnimation>
      )}
    </>
  );
};
