import { Enemy } from '..';
import { EnemyFactory } from '../factory';
import { EnemyTexture, EnemyVariant } from '../types';
import type { EnemyVariantData } from '../types';

import type { IWorld } from '~scene/world/types';

export class EnemyStranger extends Enemy {
  constructor(scene: IWorld, data: EnemyVariantData) {
    super(scene, {
      ...data,
      texture: EnemyTexture.STRANGER,
      multipliers: {
        health: 1.5,
        damage: 0.8,
        speed: 0.7,
      },
    });
  }

  protected onDead() {
    this.spawnAdherents();
    super.onDead();
  }

  private spawnAdherents() {
    const offsets = [
      { x: 0, y: -10 },
      { x: 5, y: 5 },
      { x: -5, y: 5 },
    ];

    offsets.forEach((offset) => {
      EnemyFactory.create(this.scene, EnemyVariant.ADHERENT, {
        level: this.level,
        positionAtWorld: {
          x: this.x + offset.x,
          y: this.y + offset.y,
        },
      });
    });
  }
}
