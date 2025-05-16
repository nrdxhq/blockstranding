import { useEvent, useScene } from 'phaser-react-ui';
import React, { useState } from 'react';

import { GameScene } from '~game/types';
import { Amount } from '~scene/system/interface/amount';
import { PlayerEvent } from '~scene/world/entities/player/types';
import type { IWorld } from '~scene/world/types';

export const Coins: React.FC = () => {
  const world = useScene<IWorld>(GameScene.WORLD);

  const [amount, setAmount] = useState(world.player.coins);

  useEvent(world.player, PlayerEvent.UPDATE_COINS, (coins: number) => {
    setAmount(coins);
  }, []);

  return (
    <Amount type="COINS" placeholder={true}>
      {amount}
    </Amount>
  );
};
