import React from 'react';

import type { InterfaceTextColor } from '~lib/interface/types';

import { Wrapper, Label, Values, Value } from './styles';

type Props = {
  label: string
  values: (string | {
    value: string
    color?: InterfaceTextColor
  })[]
  currentValue?: string
  onChange: (value: any) => void
};

export const Setting: React.FC<Props> = ({
  label,
  values,
  currentValue,
  onChange,
}) => (
  <Wrapper>
    <Label>{label.replace(/_/g, ' ')}</Label>
    <Values>
      {values.map((item) => {
        const value = typeof item === 'string' ? item : item.value;
        const color = typeof item === 'string' ? undefined : item.color;

        return (
          <Value
            key={value}
            onClick={() => onChange(value)}
            $active={currentValue === value}
            $color={color}
          >
            {value}
          </Value>
        );
      })}
    </Values>
  </Wrapper>
);
