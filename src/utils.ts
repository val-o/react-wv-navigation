import { MutableRefObject, useRef } from 'react';

export const useLazyRef = <T>(initialValFunc: () => T) => {
  const ref: MutableRefObject<T | null> = useRef(null);
  if (ref.current === null) {
    ref.current = initialValFunc();
  }
  return ref as MutableRefObject<T>;
};

export const isDefined = <T>(it: T): it is Exclude<T, undefined | null> =>
  it !== null && it !== undefined;

export const compact = <T>(arr: T[]): Exclude<T, undefined | null>[] => {
  // there is no guard overload in built-in .filter function so we cast it up
  return arr.filter(it => isDefined(it)) as Exclude<T, undefined | null>[];
};

export const last = <T>(arr: T[]) => arr[arr.length - 1] ?? undefined;

export const noop = () => {};
