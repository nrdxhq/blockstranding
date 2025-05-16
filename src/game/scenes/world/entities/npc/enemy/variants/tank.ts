import { Enemy } from '..';
import { EnemyTexture } from '../types';
import type { EnemyVariantData } from '../types';

import { DIFFICULTY } from '~game/difficulty';
import { progressionQuadratic } from '~lib/progression';
import type { IWorld } from '~scene/world/types';

export class EnemyTank extends Enemy {
  constructor(scene: IWorld, data: EnemyVariantData) {
    super(scene, {
      ...data,
      texture: EnemyTexture.TANK,
      multipliers: {
        health: 1.8,
        damage: 0.6,
        speed: 0.7,
      },
    });

    const armour = progressionQuadratic({
      defaultValue: DIFFICULTY.ENEMY_ARMOUR,
      scale: DIFFICULTY.ENEMY_ARMOUR_GROWTH,
      level: this.level,
      retardationLevel: DIFFICULTY.ENEMY_ARMOUR_GROWTH_RETARDATION_LEVEL,
    });

    this.live.setMaxArmour(armour);
    this.live.setArmour(armour);

    this.addIndicator('armour', {
      color: 0x00d4ff,
      value: () => this.live.armour / this.live.maxArmour,
      destroyIf: (value: number) => value === 0,
    });
  }
}
