import React, { useMemo } from 'react';

import { Wrapper, Icon, Value } from './styles';

export const Coins: React.FC = () => {
  const coins = useMemo(() => {
    const value = Number(localStorage.getItem('COINS'));
    return Number.isFinite(value) ? value : 0;
  }, []);

  return (
    <Wrapper>
      <Icon src="assets/sprites/hud/coins.png" />
      <Value>
        {coins}
      </Value>
    </Wrapper>
  );
};

