import { Box } from '@material-ui/core';
import React from 'react';
import { PanelHeader } from './PanelHeader';

export default {
  title: 'Layout/PanelHeader',
  decorators: [],
};

export const Index = () => {
  return (
    <Box>
      <PanelHeader>First</PanelHeader>
      <PanelHeader onLeftAction={() => {}} leftAction="back">
        First
      </PanelHeader>
      <PanelHeader onLeftAction={() => {}} leftAction="close">
        Second
      </PanelHeader>
      <PanelHeader onLeftAction={() => {}} leftAction="close">
        Second
      </PanelHeader>
      <PanelHeader onLeftAction={() => {}} leftAction="close">
        Second Long Long Long Long
      </PanelHeader>
    </Box>
  );
};

export const Back = () => {
  return (
    <Box>
      <PanelHeader onLeftAction={() => {}} leftAction="back">
        First
      </PanelHeader>
    </Box>
  );
};
