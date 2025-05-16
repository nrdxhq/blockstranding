import { Enemy } from '..';
import { ENEMY_EXPLOSION_RADIUS, ENEMY_EXPLOSION_EFFECT_COLOR, ENEMY_EXPLOSION_EFFECT_DURATION } from '../const';
import { EnemyTexture } from '../types';
import type { EnemyVariantData, IEnemy, IEnemyTarget } from '../types';

import { getIsometricDistance } from '~lib/dimension';
import { EntityType } from '~scene/world/entities/types';
import { EffectAudio } from '~scene/world/fx-manager/effect/types';
import { LEVEL_MAP_PERSPECTIVE } from '~scene/world/level/const';
import type { IWorld } from '~scene/world/types';

export class EnemyExplosive extends Enemy {
  constructor(scene: IWorld, data: EnemyVariantData) {
    super(scene, {
      ...data,
      texture: EnemyTexture.EXPLOSIVE,
      multipliers: {
        health: 1.2,
        damage: 0.4,
        speed: 0.5,
      },
    });
  }

  protected onDead() {
    this.createExplosion();
    super.onDead();
  }

  private createExplosion() {
    const position = this.getBottomEdgePosition();
    const d = ENEMY_EXPLOSION_RADIUS * 2;
    const area = this.scene.add.ellipse(position.x, position.y, d, d * LEVEL_MAP_PERSPECTIVE);

    area.setFillStyle(ENEMY_EXPLOSION_EFFECT_COLOR, 0.25);

    this.scene.tweens.add({
      targets: area,
      alpha: 0.0,
      duration: ENEMY_EXPLOSION_EFFECT_DURATION,
      onComplete: () => {
        area.destroy();
      },
    });

    this.scene.fx.createExplosionEffect(this);
    this.scene.fx.playSound(EffectAudio.EXPLOSION);

    let targets: IEnemyTarget[] = [this.scene.player];

    targets = targets.concat(this.scene.getEntities<IEnemy>(EntityType.ENEMY));

    targets.forEach((target) => {
      if (target.active && target !== this) {
        const distance = getIsometricDistance(position, target.getBottomEdgePosition());

        if (distance <= ENEMY_EXPLOSION_RADIUS) {
          const multiplier = Math.min(1.0, 0.5 + (1 - (distance / ENEMY_EXPLOSION_RADIUS)));

          target.live.damage(this.damage * multiplier);
        }
      }
    });
  }
}
