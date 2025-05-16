import { InterfaceTextColor } from '~lib/interface/types';

export const PARAM_VALUES: {
  value: string
  color?: InterfaceTextColor
}[] = [
  { value: 'ON' },
  { value: 'OFF', color: InterfaceTextColor.ERROR },
];
