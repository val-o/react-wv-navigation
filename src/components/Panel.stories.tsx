import { useLazyRef, noop } from '../utils';
import React from 'react';
import { useTimeout } from 'react-use';
import { Panel } from './Panel';
import { PanelBody } from './built-in/PanelBody';
import { PanelHeader } from './built-in/PanelHeader';
import { makeSwipeController } from './swipeController';

export default {
  title: 'Panel',
  decorators: [],
};

const Cmp: React.FC = props => {
  return (
    <PanelBody>
      <PanelHeader onBack={() => {}}></PanelHeader>
      <div>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </div>
      <div>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </div>
      <div>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </div>
      <div>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </div>
      <div>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, saepe
        modi! Obcaecati eum et blanditiis sequi cupiditate consequatur, culpa
        repellendus maxime minima! Dignissimos sequi pariatur, magnam nesciunt
        illum possimus placeat.
      </div>
    </PanelBody>
  );
};

const swipeController = makeSwipeController();
export const JustActiveFromBottom = () => {
  return (
    <Panel
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={false}
      panelId="1"
      appearAnimation="bottom-top"
      state="active"
      // panelState={EPanelState.Pushing}
    >
      <Cmp />
    </Panel>
  );
};
export const JustActive = () => {
  return (
    <Panel
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={false}
      panelId="1"
      state="active"
      // panelState={EPanelState.Pushing}
    >
      <Cmp />
    </Panel>
  );
};

export const FromActiveToBackground = () => {
  const [isReady] = useTimeout(500);
  return (
    <Panel
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={false}
      panelId="1"
      state={isReady() ? 'background' : 'active'}
      // panelState={EPanelState.Pushing}
    >
      <Cmp />
    </Panel>
  );
};

export const FromActiveToPopped = () => {
  const [isReady] = useTimeout(500);
  return (
    <Panel
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={false}
      panelId="1"
      state={isReady() ? 'popped' : 'active'}
    >
      <Cmp />
    </Panel>
  );
};

export const FromBackgroundToActive = () => {
  const [isReady] = useTimeout(500);
  return (
    <Panel
      onAnimationDone={noop}
      swipeController={swipeController}
      canGoBack={true}
      // active={true}
      panelId="1"
      state={isReady() ? 'active' : 'background'}
      // panelState={EPanelState.Pushing}
    >
      <Cmp />
    </Panel>
  );
};

export const ActiveAndBackground = () => {
  const [isReady] = useTimeout(500);
  const swipeController = useLazyRef(makeSwipeController).current;

  return (
    <>
      <Panel
        onAnimationDone={noop}
        canGoBack={true}
        swipeController={swipeController}
        // active={true}
        panelId="1"
        state={isReady() ? 'background' : 'active'}
        // panelState={EPanelState.Pushing}
      >
        <Cmp />
      </Panel>
      {isReady() && (
        <Panel
          onAnimationDone={noop}
          canGoBack={true}
          swipeController={swipeController}
          // active={true}
          panelId="2"
          state={'active'}
          // panelState={EPanelState.Pushing}
        >
          <Cmp />
        </Panel>
      )}
    </>
  );
};
