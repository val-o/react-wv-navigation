import * as RouterState from '../core/RouterState';
import { BehaviorSubject } from 'rxjs';
import { styledLogMessage } from '../utils';

export type RouterApi = {
  pushScreen: (options: RouterState.PushOptions) => void;
  popScreen: <TPopExtras extends object = {}>(
    options?: RouterState.PopOptions<TPopExtras> | undefined
  ) => void;
  markToClearHistoryUntil: (options: RouterState.ClearHistoryOptions) => void;
};

export class RouterController implements RouterApi {
  private _clearHistoryOptions: RouterState.ClearHistoryOptions | undefined;
  private _routerState = new BehaviorSubject<RouterState.State>(
    RouterState.create()
  );

  public get routerState$() {
    return this._routerState.asObservable();
  }

  public get routerState() {
    return this._routerState.getValue();
  }

  constructor(public loggingEnabled = false) {
    this._routerState.subscribe(state => {
      const keys = state.items.map(s => s.key).join(',');
      this.whenLogEnabled(() => {
        console.log(...styledLogMessage(`Router state [${keys}]`), state);
      });
    });
  }

  public pushScreen = (options: RouterState.PushOptions) => {
    this.whenLogEnabled(() => {
      console.log(
        ...styledLogMessage(`Pushing screen with key ${options.key}`),
        options
      );
    });
    const [state, error] = RouterState.pushScreen(
      this._routerState.getValue(),
      options
    );

    if (error) {
      this.whenLogEnabled(() => {
        console.log(...getErrorMessage(error));
      });
    }

    this._routerState.next(state);
  };

  public popScreen = <TPopExtras extends object = {}>(
    options?: RouterState.PopOptions<TPopExtras>
  ) => {
    this.whenLogEnabled(() => {
      console.log(...styledLogMessage(`Start popping active screen`), options);
    });

    const [state, error] = RouterState.popScreen(
      this._routerState.getValue(),
      options
    );

    if (error) {
      this.whenLogEnabled(() => {
        console.log(...getErrorMessage(error));
      });
    }

    this._routerState.next(state);
  };

  public onScreenEntered = () => {
    const [newState, error] = RouterState.screenEntered(
      this.routerState,
      this._clearHistoryOptions
    );
    this._clearHistoryOptions = undefined;
    if (error) {
      this.whenLogEnabled(() => {
        console.log(...getErrorMessage(error));
      });
    }
    this._routerState.next(newState);
  };

  public onScreenExited = () => {
    const newState = RouterState.screenExited(this.routerState);
    this._routerState.next(newState);
  };

  public markToClearHistoryUntil = (
    options: RouterState.ClearHistoryOptions
  ) => {
    this.whenLogEnabled(() => {
      console.log(...styledLogMessage(`Start popping active screen`), options);
    });
    this._clearHistoryOptions = options;
  };

  private whenLogEnabled = (logFn: () => void) => {
    if (this.loggingEnabled) {
      logFn();
    }
  };
}

type Error =
  | RouterState.PopError
  | RouterState.PushError
  | RouterState.ClearHistoryError
  | RouterState.ScreenEnteredError;

const getErrorMessage = (
  error:
    | RouterState.PopError
    | RouterState.PushError
    | RouterState.ClearHistoryError
    | RouterState.ScreenEnteredError
): string[] => {
  switch (error.type) {
    case 'NavigationInProgress': {
      return styledLogMessage(
        `Trying to navigate while navigation is in progress. Doing nothing...`
      );
    }
    case 'NewScreenNotFound': {
      return styledLogMessage(`Screen wasn't found during poping`);
    }
    case 'NoActiveScreen': {
      return styledLogMessage(
        `Cannot pop as there is no screens before active`
      );
    }
    case 'ClearHistoryUntilNotFound': {
      return styledLogMessage(
        `Couldn't find screen with key ${error.key} for clearing, doing nothing`
      );
    }
    case 'DuplicateKeyFound': {
      return styledLogMessage(
        `Trying to push screen with non-unique key: ${error.key}`
      );
    }
  }
};
