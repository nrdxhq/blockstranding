import { Enemy } from '..';
import { ENEMY_REGENERATION_RADIUS, ENEMY_REGENERATION_EFFECT_DURATION, ENEMY_REGENERATION_EFFECT_COLOR } from '../const';
import { EnemyTexture } from '../types';
import type { EnemyVariantData, IEnemy } from '../types';

import { getIsometricDistance } from '~lib/dimension';
import { EntityType } from '~scene/world/entities/types';
import { LEVEL_MAP_PERSPECTIVE } from '~scene/world/level/const';
import type { IWorld } from '~scene/world/types';

export class EnemyTelepath extends Enemy {
  private regenerateArea: Phaser.GameObjects.Ellipse;

  private regenerateTimer: Nullable<Phaser.Time.TimerEvent> = null;

  constructor(scene: IWorld, data: EnemyVariantData) {
    super(scene, {
      ...data,
      texture: EnemyTexture.TELEPATH,
      multipliers: {
        health: 1.5,
        damage: 1.0,
        speed: 0.8,
      },
    });

    this.addArea();

    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.removeArea();
      this.regenerateTimer?.destroy();
    });
  }

  public update() {
    super.update();

    try {
      this.updateArea();
    } catch (error) {
      console.warn('Failed to update telepth enemy', error as TypeError);
    }
  }

  private updateArea() {
    if (!this.regenerateArea.visible) {
      return;
    }

    const position = this.getBottomEdgePosition();

    this.regenerateArea.setPosition(position.x, position.y);
  }

  protected onDamage(amount: number) {
    this.healNearbyEnemies(amount);
    super.onDamage(amount);
  }

  private healNearbyEnemies(amount: number) {
    const position = this.getBottomEdgePosition();
    const enemies: IEnemy[] = [];

    this.scene.getEntities<IEnemy>(EntityType.ENEMY).forEach((enemy) => {
      if (!(enemy instanceof EnemyTelepath) && !enemy.live.isMaxHealth()) {
        const distance = getIsometricDistance(position, enemy.getBottomEdgePosition());

        if (distance <= ENEMY_REGENERATION_RADIUS) {
          enemies.push(enemy);
        }
      }
    });

    if (enemies.length > 0) {
      if (this.regenerateTimer) {
        this.regenerateTimer.destroy();
      } else {
        this.regenerateArea.setVisible(true);
      }

      this.regenerateTimer = this.scene.addProgression({
        duration: ENEMY_REGENERATION_EFFECT_DURATION,
        onComplete: () => {
          this.regenerateTimer = null;
          this.regenerateArea.setVisible(false);
        },
      });

      enemies.forEach((enemy) => {
        const healthAmount = Math.floor(amount / enemies.length);

        enemy.live.heal(healthAmount);
      });
    }
  }

  private addArea() {
    const d = ENEMY_REGENERATION_RADIUS * 2;

    this.regenerateArea = this.scene.add.ellipse(0, 0, d, d * LEVEL_MAP_PERSPECTIVE);
    this.regenerateArea.setVisible(false);
    this.regenerateArea.setFillStyle(ENEMY_REGENERATION_EFFECT_COLOR, 0.33);
  }

  private removeArea() {
    this.regenerateArea.destroy();
  }
}
