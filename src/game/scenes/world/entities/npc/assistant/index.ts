import { NPC } from '..';
import { PlayerSkill } from '../../player/types';
import type { IPlayer } from '../../player/types';
import { ShotBallFire } from '../../shot/ball/variants/fire';
import { ShotLazer } from '../../shot/lazer';
import type { IShot, ShotParams, IShotFactory } from '../../shot/types';
import { EntityType } from '../../types';
import type { IEnemy } from '../enemy/types';

import { ASSISTANT_TILE_SIZE, ASSISTANT_PATH_BREAKPOINT, ASSISTANT_WEAPON } from './const';
import type { IAssistant, AssistantData } from './types';
import { AssistantVariant, AssistantTexture } from './types';

import { DIFFICULTY } from '~game/difficulty';
import { Assets } from '~lib/assets';
import { getIsometricDistance, getClosestByIsometricDistance } from '~lib/dimension';
import { progressionQuadratic } from '~lib/progression';
import type { IWorld } from '~scene/world/types';

Assets.RegisterSprites(AssistantTexture, ASSISTANT_TILE_SIZE);

export class Assistant extends NPC implements IAssistant {
  private shot: IShot;

  private owner: IPlayer;

  private shotDefaultParams: ShotParams;

  private nextAttackTimestamp: number = 0;

  private instantShot: boolean = true;

  private variant: AssistantVariant;

  constructor(scene: IWorld, {
    owner, positionAtMatrix, speed,
  }: AssistantData) {
    super(scene, {
      texture: AssistantTexture.DEFAULT,
      positionAtMatrix,
      speed,
      pathFindTriggerDistance: ASSISTANT_PATH_BREAKPOINT,
      customAnimation: true,
      body: {
        ...ASSISTANT_TILE_SIZE,
        type: 'circle',
      },
    });
    scene.add.existing(this);

    this.owner = owner;

    this.registerAnimations();
    this.setVariant(AssistantVariant.DEFAULT);
  }

  public update() {
    super.update();

    try {
      if (this.pathPassed) {
        this.setVelocity(0, 0);
      }

      if (this.isCanAttack()) {
        this.attack();
      }
    } catch (error) {
      console.warn('Failed to update assistant', error as TypeError);
    }
  }

  private isCanAttack() {
    return (
      this.nextAttackTimestamp < this.scene.getTime()
      && !this.owner.live.isDead()
    );
  }

  private attack() {
    const target = this.getTarget();

    if (!target) {
      return;
    }

    const params = this.getShotCurrentParams();
    const instantAttack = this.instantShot && this.shot instanceof ShotBallFire;
    const now = this.scene.getTime();
    const pause = instantAttack ? 0 : progressionQuadratic({
      defaultValue: DIFFICULTY.ASSISTANT_ATTACK_PAUSE,
      scale: DIFFICULTY.ASSISTANT_ATTACK_PAUSE_GROWTH,
      level: this.owner.upgradeLevel[PlayerSkill.ASSISTANT_ATTACK_SPEED],
    });

    this.shot.shoot(target, params);

    this.nextAttackTimestamp = now + Math.max(pause, 200);
    this.instantShot = !this.instantShot;
  }

  private getTarget() {
    const assistantPosition = this.getBottomEdgePosition();
    const maxDistance = progressionQuadratic({
      defaultValue: DIFFICULTY.ASSISTANT_ATTACK_DISTANCE,
      scale: DIFFICULTY.ASSISTANT_ATTACK_DISTANCE_GROWTH,
      level: this.owner.upgradeLevel[PlayerSkill.ASSISTANT_ATTACK_DISTANCE],
    });
    const enemies = this.scene.getEntities<IEnemy>(EntityType.ENEMY).filter((enemy) => {
      if (enemy.alpha >= 1.0 && !enemy.live.isDead()) {
        const enemyPosition = enemy.getBottomEdgePosition();

        return (
          getIsometricDistance(enemyPosition, assistantPosition) <= maxDistance
          && !this.scene.level.hasTilesBetweenPositions(enemyPosition, assistantPosition)
        );
      }

      return false;
    });

    return getClosestByIsometricDistance(enemies, this);
  }

  private setVariant(variant: AssistantVariant) {
    this.variant = variant;

    this.setWeapon(ASSISTANT_WEAPON[this.variant]);
    this.setTexture(AssistantTexture[this.variant]);
    this.anims.play(`idle.${this.texture.key}`);
  }

  private setWeapon(Shot: IShotFactory) {
    if (this.shot) {
      this.shot.destroy();
    }

    this.shot = new Shot(this.scene, {
      maxDistance: DIFFICULTY.ASSISTANT_ATTACK_DISTANCE,
      speed: DIFFICULTY.ASSISTANT_ATTACK_SPEED,
      damage: DIFFICULTY.ASSISTANT_ATTACK_DAMAGE,
    }, {
      scale: 0.5,
    });

    this.shot.setInitiator(this, () => this.body.center);
    this.shotDefaultParams = this.shot.params;
  }

  private getShotCurrentParams() {
    const params: ShotParams = {
      speed: this.shotDefaultParams.speed,
      maxDistance:
        this.shotDefaultParams.maxDistance
        && progressionQuadratic({
          defaultValue: this.shotDefaultParams.maxDistance,
          scale: DIFFICULTY.ASSISTANT_ATTACK_DISTANCE_GROWTH,
          level: this.owner.upgradeLevel[PlayerSkill.ASSISTANT_ATTACK_DISTANCE],
        }),
      damage:
        this.shotDefaultParams.damage
        && progressionQuadratic({
          defaultValue: this.shotDefaultParams.damage * (this.shot instanceof ShotLazer ? 1.5 : 1.0),
          scale: DIFFICULTY.ASSISTANT_ATTACK_DAMAGE_GROWTH,
          level: this.owner.upgradeLevel[PlayerSkill.ASSISTANT_ATTACK_DAMAGE],
        }),
    };

    return params;
  }

  private registerAnimations() {
    Object.values(AssistantTexture).forEach((texture) => {
      this.anims.create({
        key: `idle.${texture}`,
        frames: this.anims.generateFrameNumbers(texture, {}),
        frameRate: 4,
        repeat: -1,
        delay: Math.random() * 500,
      });
    });
  }
}
