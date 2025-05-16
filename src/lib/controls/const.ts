import type { ControlItem } from './types';

export const CONTROL_KEY = {
  PAUSE: 'keyup-ESC',
  ATTACK: 'keyup-SPACE',
};

export const CONTROLS: ControlItem[] = [
  { keys: 'W,A,S,D', label: 'MOVEMENT' },
  { keys: 'SPACE', label: 'ATTACK' },
];
