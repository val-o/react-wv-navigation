import * as RoutingS from '../core/RouterState';

export type PanelState =
  | 'active' /* Active */
  | 'background' /* Direct previous entry in history */
  | 'none' /* deeply in history  */
  | 'popped' /* Exiting */;
