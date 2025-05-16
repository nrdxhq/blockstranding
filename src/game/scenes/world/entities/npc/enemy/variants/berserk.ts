import { Enemy } from '..';
import { ENEMY_HEAL_MULTIPLIER, ENEMY_HEAL_DELAY } from '../const';
import { EnemyTexture } from '../types';
import type { EnemyVariantData } from '../types';

import type { IWorld } from '~scene/world/types';

export class EnemyBerserk extends Enemy {
  private healTimestamp: number = 0;

  private healAmount: number = 0;

  constructor(scene: IWorld, data: EnemyVariantData) {
    super(scene, {
      ...data,
      texture: EnemyTexture.BERSERK,
      multipliers: {
        health: 2.0,
        damage: 1.0,
        speed: 0.7,
      },
    });

    this.healAmount = Math.ceil(this.live.maxHealth * ENEMY_HEAL_MULTIPLIER);
  }

  public update() {
    super.update();

    try {
      this.regenerateHealth();
    } catch (error) {
      console.warn('Failed to update berserk enemy', error as TypeError);
    }
  }

  private regenerateHealth() {
    if (
      this.scene.player.live.isDead()
      || this.live.isDead()
      || this.live.isMaxHealth()
    ) {
      return;
    }

    const now = this.scene.getTime();
    if (now < this.healTimestamp) {
      return;
    }

    this.healTimestamp = now + ENEMY_HEAL_DELAY;

    this.live.heal(this.healAmount);
  }
}
