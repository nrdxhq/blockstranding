import React from 'react';

import { Section } from '~game/scenes/system/interface/section';

import { Copy, Field, Placeholder } from './styles';

type Props = {
  label: string;
  value: string;
  placeholder?: string;
}

export const WalletField: React.FC<Props> = ({ label, value, placeholder }) => {
  const handleClickCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <Section direction="vertical" gap={5}>
      <Field>
        <Field.Label>{label}</Field.Label>
        <Field.Value>
          {value}
          <Copy onClick={handleClickCopy} />
        </Field.Value>
      </Field>
      {placeholder && (
        <Placeholder>{placeholder}</Placeholder>
      )}
    </Section>
  );
};
