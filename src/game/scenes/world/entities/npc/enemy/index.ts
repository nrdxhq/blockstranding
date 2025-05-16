import Phaser from 'phaser';

import { NPC } from '..';
import { EntityType } from '../../types';

import { ENEMY_SIZE_PARAMS, ENEMY_TEXTURE_SIZE, ENEMY_PATH_BREAKPOINT, ENEMY_PURSUIT_TRIGGER_DISTANCE } from './const';
import { EnemyAudio, EnemyTexture } from './types';
import type { IEnemy, EnemyData, IEnemyTarget } from './types';

import { DIFFICULTY } from '~game/difficulty';
import { GameSettings } from '~game/types';
import { Assets } from '~lib/assets';
import { getDistance } from '~lib/dimension';
import { InterfaceFont } from '~lib/interface/types';
import { progressionQuadratic, progressionLinear } from '~lib/progression';
import { WORLD_DEPTH_GRAPHIC } from '~scene/world/const';
import type { IWorld } from '~scene/world/types';

Assets.RegisterAudio(EnemyAudio);
Assets.RegisterSprites(EnemyTexture, (texture) => (
  ENEMY_SIZE_PARAMS[ENEMY_TEXTURE_SIZE[texture]]
));

export abstract class Enemy extends NPC implements IEnemy {
  private _damage: number;
  public get damage() { return this._damage; }
  private set damage(v) { this._damage = v; }

  private damageLabel: Nullable<Phaser.GameObjects.Text> = null;

  private damageLabelTween: Nullable<Phaser.Tweens.Tween> = null;

  protected level: number;

  private isOverlapTarget: boolean = false;

  constructor(scene: IWorld, {
    texture, multipliers, level, ...data
  }: EnemyData) {
    super(scene, {
      ...data,
      texture,
      pathFindTriggerDistance: ENEMY_PATH_BREAKPOINT,
      health: progressionQuadratic({
        defaultValue: DIFFICULTY.ENEMY_HEALTH
          * multipliers.health,
        scale: DIFFICULTY.ENEMY_HEALTH_GROWTH,
        level,
        retardationLevel: DIFFICULTY.ENEMY_HEALTH_GROWTH_RETARDATION_LEVEL,
      }),
      speed: progressionLinear({
        defaultValue: DIFFICULTY.ENEMY_SPEED * multipliers.speed,
        scale: DIFFICULTY.ENEMY_SPEED_GROWTH,
        level,
        maxLevel: DIFFICULTY.ENEMY_SPEED_GROWTH_MAX_LEVEL,
      }),
      body: {
        ...ENEMY_SIZE_PARAMS[ENEMY_TEXTURE_SIZE[texture]],
        type: 'circle',
      },
    });
    scene.addEntityToGroup(this, EntityType.ENEMY);

    this.damage = progressionLinear({
      defaultValue: DIFFICULTY.ENEMY_DAMAGE
        * multipliers.damage,
      scale: DIFFICULTY.ENEMY_DAMAGE_GROWTH,
      level,
    });
    this.level = level;

    this.addDamageLabel();
    this.addIndicator('health', {
      color: 0xff3d3d,
      value: () => this.live.health / this.live.maxHealth,
    });

    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.removeDamageLabel();
    });
  }

  public update() {
    super.update();

    try {
      if (this.isOverlapTarget) {
        this.setVelocity(0, 0);
      } else if (this.pathPassed) {
        this.moveTo(this.scene.player.getBottomEdgePosition());
      }

      this.isOverlapTarget = false;
    } catch (error) {
      console.warn('Failed to update enemy', error as TypeError);
    }
  }

  override isCanPursuit() {
    return (
      super.isCanPursuit() &&
      (
        this.isPursuitTriggeredBefore ||
        getDistance(this.positionAtMatrix, this.scene.player.positionAtMatrix) <= ENEMY_PURSUIT_TRIGGER_DISTANCE
      )
    );
  }

  public overlapTarget() {
    this.isOverlapTarget = true;
  }

  public attack(target: IEnemyTarget) {
    if (this.isFreezed() || target.live.isDead()) {
      return;
    }

    this.freeze(1000);

    target.live.damage(this.damage);
  }

  private addDamageLabel() {
    this.damageLabel = this.scene.add.text(0, 0, '', {
      fontSize: '6px',
      fontFamily: InterfaceFont.PIXEL_TEXT,
      align: 'center',
      color: '#fff',
      resolution: 2,
    });

    this.damageLabel.setOrigin(0.5, 0.5);
    this.damageLabel.setDepth(WORLD_DEPTH_GRAPHIC);
    this.damageLabel.setActive(false);
    this.damageLabel.setVisible(false);
  }

  private updateDamageLabel(amount: number) {
    if (!this.damageLabel) {
      return;
    }

    this.damageLabel.setText(amount.toString());
    this.damageLabel.setPosition(this.body.center.x, this.body.center.y);
    this.damageLabel.setActive(true);
    this.damageLabel.setVisible(true);
    this.damageLabel.setAlpha(1.0);

    if (this.damageLabelTween) {
      this.damageLabelTween.reset();
    } else {
      this.damageLabelTween = this.scene.tweens.add({
        targets: this.damageLabel,
        alpha: { from: 1.0, to: 0.0 },
        duration: 1000,
        delay: 250,
        onComplete: () => {
          if (this.damageLabel) {
            if (this.active) {
              this.damageLabel.setActive(false);
              this.damageLabel.setVisible(false);
            } else {
              this.damageLabel.destroy();
              this.damageLabel = null;
            }
          }
          if (this.damageLabelTween) {
            this.damageLabelTween.destroy();
            this.damageLabelTween = null;
          }
        },
      });
    }
  }

  private removeDamageLabel() {
    if (this.damageLabel && !this.damageLabelTween) {
      this.damageLabel.destroy();
      this.damageLabel = null;
    }
  }

  protected onDamage(amount: number) {
    if (this.scene.game.isSettingEnabled(GameSettings.SHOW_DAMAGE)) {
      this.updateDamageLabel(amount);
    }

    super.onDamage(amount);
  }

  protected onDead() {
    this.scene.player.giveCoins(this.level);
    this.scene.player.incrementKills();

    this.addBloodEffect();

    super.onDead();
  }

  private addBloodEffect() {
    if (!this.currentBiome?.solid) {
      return;
    }

    const position = this.getBottomEdgePosition();
    const effect = this.scene.fx.createBloodStainEffect(position);

    if (effect) {
      effect.setAlpha(0.8);
      this.scene.level.effectsOnGround.push(effect);
    }
  }
}
