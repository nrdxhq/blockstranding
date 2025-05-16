import { useScene } from 'phaser-react-ui';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Amount } from './amount';

import type { CoinAmount, ICoin } from '~game/scenes/world/entities/coin/types';
import { CoinEvents } from '~game/scenes/world/entities/coin/types';
import { GameScene } from '~game/types';
import { EntityType } from '~scene/world/entities/types';
import type { IWorld } from '~scene/world/types';

export const CoinsAmount: React.FC = () => {
  const world = useScene<IWorld>(GameScene.WORLD);

  const [amounts, setAmounts] = useState<Record<string, CoinAmount>>({});

  const showAmount = (crystal: ICoin, value: number) => {
    setAmounts((current) => ({
      ...current,
      [uuidv4()]: {
        position: {
          x: crystal.x,
          y: crystal.y,
        },
        value,
      },
    }));
  };

  const hideAmount = (id: string) => {
    setAmounts((current) => {
      if (!current[id]) {
        return current;
      }

      const newAmounts = { ...current };

      delete newAmounts[id];

      return newAmounts;
    });
  };

  useEffect(() => {
    const crystals = world.getEntitiesGroup(EntityType.COIN);

    crystals.on(CoinEvents.PICKUP, showAmount);

    return () => {
      crystals.off(CoinEvents.PICKUP, showAmount);
    };
  }, []);

  return Object.entries(amounts).map(([id, amount]) => (
    <Amount
      key={id}
      position={amount.position}
      value={amount.value}
      onHide={() => hideAmount(id)}
    />
  ));
};
