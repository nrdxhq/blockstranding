import { useEvent, useScene } from 'phaser-react-ui';
import React, { useEffect, useRef, useState } from 'react';

import { GameScene } from '~game/types';
import { PlayerEvent } from '~scene/world/entities/player/types';
import type { IWorld } from '~scene/world/types';

import { Wrapper, Icon, Value } from './styles';

type Props = {
  check?: boolean
  value: number | string
};

export const Cost: React.FC<Props> = ({ value, check = true }) => {
  const world = useScene<IWorld>(GameScene.WORLD);

  const refValue = useRef(value);

  const [haveAmount, setHaveAmount] = useState(world.player.coins);

  const enough = (!check || typeof value !== 'number' || haveAmount >= value);

  useEvent(world.player, PlayerEvent.UPDATE_COINS, (amount: number) => {
    setHaveAmount(amount);
  }, []);

  useEffect(() => {
    refValue.current = value;
  }, [value]);

  return (
    <Wrapper>
      <Icon src='assets/sprites/hud/coins.png' />
      <Value $attention={!enough}>{value}</Value>
    </Wrapper>
  );
};
