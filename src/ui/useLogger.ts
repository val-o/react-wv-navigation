import { useOptionsContext } from '../WVNavigationProvider';

type Log = typeof console.log;
export const useLogger = (): Log => {
  const config = useOptionsContext();

  return config.loggingEnabled
    ? (...args: any[]) => console.log(...args) /** Should be wrapped */
    : () => {};
};
