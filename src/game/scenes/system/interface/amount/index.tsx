import React from 'react';

import { Icon, IconContainer, Value, Wrapper, Container, Placeholder } from './styles';

type Props = {
  children: React.ReactNode
  type: string
  placeholder?: boolean
};

export const Amount: React.FC<Props> = ({ children, type, placeholder }) => (
  <Wrapper>
    <Container>
      <IconContainer>
        <Icon src={`assets/sprites/hud/${type.toLowerCase()}.png`} />
      </IconContainer>
      <Value>{children}</Value>
    </Container>
    {placeholder && (
      <Placeholder>{type}</Placeholder>
    )}
  </Wrapper>
);
