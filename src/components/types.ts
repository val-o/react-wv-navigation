export type PanelState =
  | /* Active */ 'active'
  | /* Direct previous entry in history */ 'background'
  | /* deeply in history  */ 'none'
  | /* Exiting */ 'popped';
