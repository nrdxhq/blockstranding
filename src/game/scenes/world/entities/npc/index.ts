import Phaser from 'phaser';

import { Sprite } from '..';
import { EntityType } from '../types';

import { NPC_PATH_FIND_RATE } from './const';
import type { INPC, NPCData } from './types';

import { DEBUG_MODS } from '~game/const';
import { isPositionsEqual, getIsometricDistance, getIsometricAngle } from '~lib/dimension';
import { WORLD_DEPTH_GRAPHIC } from '~scene/world/const';
import { Level } from '~scene/world/level';
import { LEVEL_MAP_PERSPECTIVE } from '~scene/world/level/const';
import type { PositionAtWorld } from '~scene/world/level/types';
import type { IWorld } from '~scene/world/types';

export abstract class NPC extends Sprite implements INPC {
  public pathPassed: boolean = false;

  private pathToTarget: PositionAtWorld[] = [];

  private pathFindingTask: Nullable<string> = null;

  private pathFindTriggerDistance: number = 0;

  private pathFindTimestamp: number = 0;

  private pathDebug: Nullable<Phaser.GameObjects.Graphics> = null;

  private freezeTimestamp: number = 0;

  private freezeEffectTimer: Nullable<Phaser.Time.TimerEvent> = null;

  protected isPursuitTriggeredBefore: boolean = false;

  constructor(scene: IWorld, {
    pathFindTriggerDistance, texture, customAnimation, ...data
  }: NPCData) {
    super(scene, { ...data, texture });
    scene.addEntityToGroup(this, EntityType.NPC);

    this.pathFindTriggerDistance = pathFindTriggerDistance;

    this.addDebugPath();

    if (!customAnimation) {
      this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers(texture, {}),
        frameRate: 4,
        repeat: -1,
        delay: Math.random() * 500,
      });
      this.anims.play('idle');
    }

    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      if (this.freezeEffectTimer) {
        this.freezeEffectTimer.destroy();
      }
      if (this.pathFindingTask) {
        this.scene.level.navigator.cancelTask(this.pathFindingTask);
      }
    });
  }

  public update() {
    super.update();

    try {
      if (this.isCanPursuit()) {
        this.isPursuitTriggeredBefore = true;
        if (this.getDistanceToTarget() <= this.pathFindTriggerDistance) {
          this.resetPath();
          this.pathPassed = true;
        } else {
          this.findPathToTarget();
          this.moveByPath();
          this.pathPassed = false;
        }
      } else {
        this.setVelocity(0, 0);
        this.pathPassed = false;
      }
    } catch (error) {
      console.warn('Failed to update NPC', error as TypeError);
    }
  }

  public freeze(duration: number, effects: boolean = false) {
    this.freezeTimestamp = this.scene.getTime() + duration;

    if (effects) {
      this.scene.fx.createFrozeEffect(this);

      if (this.freezeEffectTimer) {
        this.freezeEffectTimer.elapsed = 0;
      } else {
        this.setTint(0x00f2ff);
        this.freezeEffectTimer = this.scene.time.delayedCall(duration, () => {
          this.clearTint();
          this.freezeEffectTimer = null;
        });
      }
    }
  }

  public isFreezed(withEffects?: boolean) {
    return (
      (this.freezeTimestamp > this.scene.getTime())
      && (!withEffects || Boolean(this.freezeEffectTimer))
    );
  }

  private findPathToTarget() {
    if (this.pathFindingTask) {
      return;
    }

    const now = Date.now();

    if (this.pathFindTimestamp > now) {
      return;
    }

    const targetPosition = this.scene.player.positionAtMatrix;

    if (this.pathToTarget.length > 0) {
      const prevPosition = this.pathToTarget[this.pathToTarget.length - 1];

      if (isPositionsEqual(prevPosition, targetPosition)) {
        return;
      }
    }

    const from = this.positionAtMatrix;

    this.pathFindTimestamp = now + NPC_PATH_FIND_RATE;
    this.pathFindingTask = this.scene.level.navigator.createTask({
      from,
      to: targetPosition,
      grid: this.scene.level.gridCollide,
    }, (path: Nullable<PositionAtWorld[]>) => {
      if (!this.active) {
        return;
      }

      if (path) {
        path.shift();
        this.pathToTarget = path;
        this.pathFindingTask = null;

        if (this.isCanPursuit()) {
          this.moveToTile();
        }

        this.drawDebugPath();
      } else {
        this.pathFindingTask = null;
      }
    });
  }

  public getDistanceToTarget() {
    return getIsometricDistance(
      this.getBottomEdgePosition(),
      this.scene.player.getBottomEdgePosition(),
    );
  }

  public moveTo(position: PositionAtWorld) {
    const rotation = getIsometricAngle(this.getBottomEdgePosition(), position);
    const direction = Phaser.Math.RadToDeg(rotation);
    const collide = this.handleCollide(direction);

    if (collide) {
      this.setVelocity(0, 0);
    } else {
      const speed = this.isFreezed() ? (this.speed * 0.2) : this.speed;
      const velocity = this.scene.physics.velocityFromRotation(rotation, speed);

      this.flipX = (velocity.x > 0);
      this.setVelocity(
        velocity.x,
        velocity.y * LEVEL_MAP_PERSPECTIVE,
      );
    }
  }

  private nextPathTile() {
    const tilePosition = Level.ToWorldPosition(this.pathToTarget[0]);
    const currentPosition = this.getBottomEdgePosition();
    const signX = Math.sign(this.body.velocity.x);
    const signY = Math.sign(this.body.velocity.y);

    if (
      currentPosition.x * signX >= tilePosition.x * signX
      && currentPosition.y * signY >= tilePosition.y * signY
    ) {
      this.pathToTarget.shift();
    }
  }

  private resetPath() {
    this.pathToTarget = [];

    if (this.pathFindingTask) {
      this.scene.level.navigator.cancelTask(this.pathFindingTask);
      this.pathFindingTask = null;
    }
  }

  private moveByPath() {
    if (this.pathToTarget.length > 0) {
      this.nextPathTile();
      this.moveToTile();
    }
  }

  private moveToTile() {
    const target = this.pathToTarget[0];

    if (target) {
      const positionAtWorld = Level.ToWorldPosition(target);

      this.moveTo(positionAtWorld);
    }
  }

  protected isCanPursuit() {
    return (
      !this.live.isDead()
      && !this.scene.player.live.isDead()
    );
  }

  private addDebugPath() {
    if (!DEBUG_MODS.path) {
      return;
    }

    this.pathDebug = this.scene.add.graphics();
    this.pathDebug.setDepth(WORLD_DEPTH_GRAPHIC);

    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.pathDebug?.destroy();
    });
  }

  private drawDebugPath() {
    if (!this.pathDebug) {
      return;
    }

    this.pathDebug.clear();
    this.pathDebug.lineStyle(2, 0xe3fc03);
    this.pathDebug.beginPath();

    const points = [
      this.positionAtMatrix,
      ...this.pathToTarget,
    ];

    for (let i = 1; i < points.length; i++) {
      const prev = Level.ToWorldPosition({ ...points[i - 1] });
      const next = Level.ToWorldPosition({ ...points[i] });

      this.pathDebug.moveTo(prev.x, prev.y);
      this.pathDebug.lineTo(next.x, next.y);
    }

    this.pathDebug.closePath();
    this.pathDebug.strokePath();
  }
}
