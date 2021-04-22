import React from 'react';
import * as RoutingState from './RoutingState';

const screenEl = React.createElement('div');
const initialState: RoutingState.State = {
  isNavigating: false,
  items: [],
  poppingEntry: undefined,
};
describe('Routing state', () => {
  describe('pushScreen', () => {
    test('simple case', () => {
      const newSt = RoutingState.pushScreen(initialState, {
        key: '1',
        screen: screenEl,
      });

      expect(newSt).toMatchObject([
        {
          isNavigating: true,
          items: [{ key: '1', originalScreenEl: screenEl }],
          poppingEntry: undefined,
        } as RoutingState.State,
        undefined,
      ]);
    });

    test('navigation is in progress', () => {
      const newSt = RoutingState.pushScreen(
        { ...initialState, isNavigating: true },
        {
          key: '1',
          screen: screenEl,
        }
      );

      expect(newSt).toMatchObject([
        { ...initialState, isNavigating: true },
        RoutingState.navigationInProgressError,
      ]);
    });
  });

  describe('popScreen', () => {
    test('without options', () => {
      const st: RoutingState.State = {
        ...initialState,
        items: [
          { key: '1', originalScreenEl: screenEl },
          { key: '2', originalScreenEl: screenEl },
        ],
      };
      const newSt = RoutingState.popScreen(st);

      expect(newSt).toMatchObject([
        {
          isNavigating: true,
          items: [{ key: '1', originalScreenEl: screenEl }],
          poppingEntry: { key: '2', originalScreenEl: screenEl },
        } as RoutingState.State,
        undefined,
      ]);
    });

    test('without options with only 1 screen', () => {
      const st: RoutingState.State = {
        ...initialState,
        items: [{ key: '1', originalScreenEl: screenEl }],
      };
      const newSt = RoutingState.popScreen(st);

      expect(newSt).toMatchObject([
        st,
        { type: 'NewScreenNotFound' } as RoutingState.PopError,
      ]);
    });

    test('to screen with key just before current', () => {
      const st: RoutingState.State = {
        ...initialState,
        items: [
          { key: '1', originalScreenEl: screenEl },
          { key: '2', originalScreenEl: screenEl },
        ],
      };
      const newSt = RoutingState.popScreen(st);

      expect(newSt).toMatchObject([
        {
          isNavigating: true,
          items: [{ key: '1', originalScreenEl: screenEl }],
          poppingEntry: { key: '2', originalScreenEl: screenEl },
        } as RoutingState.State,
        undefined,
      ]);
    });

    test('to screen with key deep in history', () => {
      const st: RoutingState.State = {
        ...initialState,
        items: [
          { key: '1', originalScreenEl: screenEl },
          { key: '2', originalScreenEl: screenEl },
          { key: '3', originalScreenEl: screenEl },
        ],
      };
      const newSt = RoutingState.popScreen(st);

      expect(newSt).toMatchObject([
        {
          isNavigating: true,
          items: [
            { key: '1', originalScreenEl: screenEl },
            { key: '2', originalScreenEl: screenEl },
          ],
          poppingEntry: { key: '3', originalScreenEl: screenEl },
        } as RoutingState.State,
        undefined,
      ]);
    });

    test('navigation is in progress', () => {
      const newSt = RoutingState.pushScreen(
        { ...initialState, isNavigating: true },
        {
          key: '1',
          screen: screenEl,
        }
      );

      expect(newSt).toMatchObject([
        { ...initialState, isNavigating: true },
        RoutingState.navigationInProgressError,
      ]);
    });
  });

  describe('screenEntered', () => {
    test('simple case', () => {
      const st: RoutingState.State = {
        isNavigating: true,
        items: [
          {
            key: '1',
            originalScreenEl: screenEl,
          },
        ],
        poppingEntry: undefined,
      };
      const newSt = RoutingState.screenEntered(st, undefined);

      expect(newSt).toMatchObject([
        {
          isNavigating: false,
          items: [
            {
              key: '1',
              originalScreenEl: screenEl,
            },
          ],
          poppingEntry: undefined,
        } as RoutingState.State,
        undefined,
      ]);
    });
  });
});
