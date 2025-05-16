import Phaser from 'phaser';

import { Sprite } from '..';
import { Coin } from '../coin';
import type { IEnemy } from '../npc/enemy/types';
import { EntityType } from '../types';

import {
  PLAYER_TILE_SIZE,
  PLAYER_SKILLS,
  PLAYER_MOVEMENT_KEYS,
  PLAYER_MAX_SKILL_LEVEL,
} from './const';
import type { PlayerData, IPlayer } from './types';
import {
  PlayerTexture,
  PlayerAudio,
  PlayerSkill,
  MovementDirection,
  PlayerEvent,
  PlayerSkillIcon,
} from './types';

import { DIFFICULTY } from '~game/difficulty';
import { GameSettings, GameEvent } from '~game/types';
import { Assets } from '~lib/assets';
import { CONTROL_KEY } from '~lib/controls/const';
import { isPositionsEqual } from '~lib/dimension';
import { progressionLinear, progressionQuadratic } from '~lib/progression';
import { Web3 } from '~lib/web3';
import { PlayerTransactionType } from '~lib/web3/types';
import type { IParticles } from '~scene/world/fx-manager/particles/types';
import { LEVEL_MAP_PERSPECTIVE } from '~scene/world/level/const';
import type { PositionAtMatrix } from '~scene/world/level/types';
import { TileType } from '~scene/world/level/types';
import type { IWorld } from '~scene/world/types';

Assets.RegisterAudio(PlayerAudio);
Assets.RegisterSprites(PlayerTexture.PLAYER, PLAYER_TILE_SIZE);
Assets.RegisterImages(PlayerTexture.ATTACK);
Assets.RegisterImages(PlayerSkillIcon);

export class Player extends Sprite implements IPlayer {
  private _coins: number = 0;
  public get coins() { return this._coins; }
  private set coins(v) { this._coins = v; }

  private _kills: number = 0;
  public get kills() { return this._kills; }
  private set kills(v) { this._kills = v; }

  private _upgradeLevel: Record<PlayerSkill, number> = {
    [PlayerSkill.MAX_HEALTH]: 1,
    [PlayerSkill.SPEED]: 1,
    [PlayerSkill.STAMINA]: 1,
    [PlayerSkill.ATTACK_DAMAGE]: 1,
    [PlayerSkill.ATTACK_DISTANCE]: 1,
    [PlayerSkill.ASSISTANT_ATTACK_DAMAGE]: 1,
    [PlayerSkill.ASSISTANT_ATTACK_DISTANCE]: 1,
    [PlayerSkill.ASSISTANT_ATTACK_SPEED]: 1,
  };
  public get upgradeLevel() { return this._upgradeLevel; }
  private set upgradeLevel(v) { this._upgradeLevel = v; }

  private movementTarget: Nullable<number> = null;

  private movementAngle: Nullable<number> = null;

  private dustEffect: Nullable<IParticles> = null;

  private staminaMax: number = 100;

  private stamina: number = 100;

  private staminaTimestamp: number = 0;

  private healTimestamp: number = 0;

  private prevPositionAtMatrix: PositionAtMatrix = { x: 0, y: 0 };

  constructor(scene: IWorld, data: PlayerData) {
    super(scene, {
      ...data,
      texture: PlayerTexture.PLAYER,
      health: DIFFICULTY.PLAYER_HEALTH,
      speed: DIFFICULTY.PLAYER_SPEED,
      body: {
        type: 'rect',
        width: 14,
        height: 26,
        gamut: PLAYER_TILE_SIZE.gamut,
      },
    });
    scene.add.existing(this);

    this.prevPositionAtMatrix = data.positionAtMatrix;

    const coins = Number(localStorage.getItem('COINS'));
    if (Number.isFinite(coins)) {
      this.coins = coins;
    }

    if (this.scene.game.isDesktop()) {
      this.handleMovementByKeyboard();
      this.handleAttackByKeyboard();
    }

    this.handleToggleEffects();

    this.registerAnimations();

    this.addDustEffect();
    this.addIndicator('health', {
      color: 0x96ff0d,
      value: () => this.live.health / this.live.maxHealth,
    });

    this.setTilesGroundCollision(true);
    this.setTilesCollision([
      TileType.MAP,
      TileType.COIN,
    ], (tile) => {
      if (tile instanceof Coin) {
        tile.pickup();
      }
    });

    this.addCollider(EntityType.ENEMY, 'collider', (enemy: IEnemy) => {
      enemy.attack(this);
    });

    this.addCollider(EntityType.ENEMY, 'overlap', (enemy: IEnemy) => {
      enemy.overlapTarget();
    });
  }

  public update() {
    super.update();

    try {
      if (!this.live.isDead()) {
        this.dustEffect?.emitter.setDepth(this.depth - 1);

        this.regenerateHealth();

        this.updateMovement();
        this.updateVelocity();
        this.updateStamina();
      }
    } catch (error) {
      console.warn('Failed to update player', error as TypeError);
    }
  }

  private regenerateHealth() {
    if (this.live.isMaxHealth()) {
      return;
    }

    const now = this.scene.getTime();
    if (now < this.healTimestamp) {
      return;
    }

    this.healTimestamp = now + DIFFICULTY.PLAYER_HEALTH_REGENERATE_DELAY;

    const amount = this.live.maxHealth * DIFFICULTY.PLAYER_HEALTH_REGENERATE_MULTIPLIER;
    this.live.heal(amount, false);
  }

  private updateStamina() {
    // Date.now used instead of world.getTime to
    // right culculate timestamp on tutorial pause
    const now = Date.now();
    const nextTimestamp = () => now + 50;

    if (this.movementAngle === null) {
      if (this.stamina < this.staminaMax && this.staminaTimestamp < now) {
        const growth = this.staminaMax * 0.04 * Math.max(0.1, this.stamina / this.staminaMax);

        this.stamina = Math.min(this.staminaMax, this.stamina + growth);
        this.staminaTimestamp = nextTimestamp();
      }
    } else if (this.stamina > 0.0 && this.staminaTimestamp < now) {
      this.useStamina(0.2);
      this.staminaTimestamp = nextTimestamp();
    }
  }

  private useStamina(amount: number) {
    this.stamina = Math.max(0.0, this.stamina - amount);

    if (this.stamina === 0.0) {
      this.updateMovementAnimation();
      this.scene.sound.stopByKey(PlayerAudio.WALK);
      this.scene.fx.playSound(PlayerAudio.WALK, {
        loop: true,
        rate: 1.4,
      });
    }

    if (this.stamina < this.staminaMax && !this.getIndicator('stamina')) {
      this.addIndicator('stamina', {
        color: 0xe7e4f5,
        value: () => this.stamina / this.staminaMax,
        destroyIf: (value: number) => value >= 1.0,
      });
    }
  }

  public giveCoins(amount: number) {
    if (this.live.isDead()) {
      return;
    }

    this.coins += amount;

    localStorage.setItem('COINS', String(this.coins));

    this.emit(PlayerEvent.UPDATE_COINS, this.coins);
  }

  public takeCoins(amount: number) {
    this.coins -= amount;

    this.emit(PlayerEvent.UPDATE_COINS, this.coins);
  }

  public incrementKills() {
    this.kills++;
  }

  public getCoinsToUpgrade(type: PlayerSkill) {
    return progressionQuadratic({
      defaultValue: PLAYER_SKILLS[type].coins,
      scale: DIFFICULTY.PLAYER_COINS_TO_UPGRADE_GROWTH,
      level: this.upgradeLevel[type],
      roundTo: 10,
    });
  }

  static GetUpgradeNextValue(type: PlayerSkill, level: number): number {
    switch (type) {
      case PlayerSkill.MAX_HEALTH: {
        return progressionQuadratic({
          defaultValue: DIFFICULTY.PLAYER_HEALTH,
          scale: DIFFICULTY.PLAYER_HEALTH_GROWTH,
          level,
          roundTo: 10,
        });
      }
      case PlayerSkill.SPEED: {
        return progressionLinear({
          defaultValue: DIFFICULTY.PLAYER_SPEED,
          scale: DIFFICULTY.PLAYER_SPEED_GROWTH,
          level,
          roundTo: 1,
        });
      }
      case PlayerSkill.STAMINA: {
        return progressionQuadratic({
          defaultValue: DIFFICULTY.PLAYER_STAMINA,
          scale: DIFFICULTY.PLAYER_STAMINA_GROWTH,
          level,
        });
      }
      default: {
        return level;
      }
    }
  }

  public upgrade(type: PlayerSkill) {
    if (this.upgradeLevel[type] === PLAYER_MAX_SKILL_LEVEL) {
      return;
    }

    const coins = this.getCoinsToUpgrade(type);

    if (this.coins < coins) {
      this.scene.game.screen.failure('Not enough coins');

      return;
    }

    this.setSkillUpgrade(type, this.upgradeLevel[type] + 1);
    this.takeCoins(coins);

    this.emit(PlayerEvent.UPGRADE_SKILL, type);

    this.scene.fx.playSound(PlayerAudio.UPGRADE);
  }

  private setSkillUpgrade(type: PlayerSkill, level: number) {
    const nextValue = Player.GetUpgradeNextValue(type, level);

    switch (type) {
      case PlayerSkill.MAX_HEALTH: {
        const addedHealth = nextValue - this.live.maxHealth;

        this.live.setMaxHealth(nextValue);
        this.live.addHealth(addedHealth);
        break;
      }
      case PlayerSkill.SPEED: {
        this.speed = nextValue;
        if (this.scene.assistant) {
          this.scene.assistant.speed = nextValue;
        }
        break;
      }
      case PlayerSkill.STAMINA: {
        this.staminaMax = nextValue;
        this.stamina = this.staminaMax;
        break;
      }
    }

    this.upgradeLevel[type] = level;
  }

  protected onDamage(amount: number) {
    this.scene.camera.shake();

    this.scene.fx.createBloodEffect(this);
    this.scene.fx.playSound([
      PlayerAudio.DAMAGE_1,
      PlayerAudio.DAMAGE_2,
      PlayerAudio.DAMAGE_3,
    ], {
      limit: 1,
    });

    super.onDamage(amount);
  }

  protected onDead() {
    this.scene.fx.playSound(PlayerAudio.DEAD);

    this.setVelocity(0, 0);
    this.stopMovement();

    this.scene.tweens.add({
      targets: [this, this.container],
      alpha: 0.0,
      duration: 250,
    });
  }

  public getLivedTime() {
    return this.scene.getTime() / 1000;
  }

  private getAttackDamage() {
    return progressionQuadratic({
      defaultValue: DIFFICULTY.PLAYER_ATTACK_DAMAGE,
      scale: DIFFICULTY.PLAYER_ATTACK_DAMAGE_GROWTH,
      level: this.upgradeLevel[PlayerSkill.ATTACK_DAMAGE],
    });
  }

  private getAttackDistance() {
    return progressionQuadratic({
      defaultValue: DIFFICULTY.PLAYER_ATTACK_DISTANCE,
      scale: DIFFICULTY.PLAYER_ATTACK_DISTANCE_GROWTH,
      level: this.upgradeLevel[PlayerSkill.ATTACK_DISTANCE],
    });
  }

  public attack() {
    if (this.stamina < DIFFICULTY.PLAYER_ATTACK_NEED_STAMINA) {
      return;
    }

    Web3.makeTransaction(PlayerTransactionType.Attack);

    const duration = 200;
    const damage = this.getAttackDamage();
    const distance = this.getAttackDistance();

    this.useStamina(DIFFICULTY.PLAYER_ATTACK_NEED_STAMINA);

    this.scene.getEntities<IEnemy>(EntityType.ENEMY)
      .filter((enemy) => enemy.getDistanceToTarget() <= distance)
      .forEach((enemy) => {
        enemy.live.damage(damage);
      });

    this.scene.fx.playSound(PlayerAudio.ATTACK);

    if (this.scene.game.isSettingEnabled(GameSettings.EFFECTS)) {
      const effect = this.scene.add.image(0, 12, PlayerTexture.ATTACK);

      this.container.add(effect);

      this.scene.tweens.add({
        targets: effect,
        scale: { from: 0.0, to: distance / 1000 },
        duration,
        onComplete: () => {
          effect.destroy();
        },
      });
    }
  }

  private handleAttackByKeyboard() {
    this.scene.input.keyboard?.on(CONTROL_KEY.ATTACK, () => {
      this.attack();
    });
  }

  private handleMovementByKeyboard() {
    const activeKeys = new Set<MovementDirection>();

    const toggleKeyState = (key: string, state: boolean) => {
      if (!PLAYER_MOVEMENT_KEYS[key]) {
        return;
      }

      if (state) {
        activeKeys.add(PLAYER_MOVEMENT_KEYS[key]);
      } else {
        activeKeys.delete(PLAYER_MOVEMENT_KEYS[key]);
      }

      if (activeKeys.has(MovementDirection.DOWN)) {
        if (activeKeys.has(MovementDirection.LEFT)) {
          this.movementTarget = 3;
        } else if (activeKeys.has(MovementDirection.RIGHT)) {
          this.movementTarget = 1;
        } else {
          this.movementTarget = 2;
        }
      } else if (activeKeys.has(MovementDirection.UP)) {
        if (activeKeys.has(MovementDirection.LEFT)) {
          this.movementTarget = 5;
        } else if (activeKeys.has(MovementDirection.RIGHT)) {
          this.movementTarget = 7;
        } else {
          this.movementTarget = 6;
        }
      } else if (activeKeys.has(MovementDirection.LEFT)) {
        this.movementTarget = 4;
      } else if (activeKeys.has(MovementDirection.RIGHT)) {
        this.movementTarget = 0;
      } else {
        this.movementTarget = null;
      }
    };

    this.scene.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, (event: KeyboardEvent) => {
      toggleKeyState(event.code, true);
    });

    this.scene.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_UP, (event: KeyboardEvent) => {
      toggleKeyState(event.code, false);
    });

    const handleMovementStop = () => {
      this.movementTarget = null;
    };

    window.addEventListener('blur', handleMovementStop);

    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      window.removeEventListener('blur', handleMovementStop);
    });
  }

  private updateVelocity() {
    if (this.movementAngle === null) {
      this.setVelocity(0, 0);
    } else {
      const collide = this.handleCollide(this.movementAngle);

      if (collide) {
        this.setVelocity(0, 0);
      } else {
        const friction = this.currentBiome?.friction ?? 1;
        const stamina = (this.stamina === 0) ? 1.5 : 1;
        const speed = (this.speed / friction) / stamina;
        const velocity = this.scene.physics.velocityFromAngle(this.movementAngle, speed);

        this.setVelocity(
          velocity.x,
          velocity.y * LEVEL_MAP_PERSPECTIVE,
        );
      }
    }
  }

  private updateMovement() {
    if (!isPositionsEqual(this.positionAtMatrix, this.prevPositionAtMatrix)) {
      this.prevPositionAtMatrix = this.positionAtMatrix;
      Web3.makeTransaction(PlayerTransactionType.Move);
    }

    if (this.movementTarget === null) {
      this.stopMovement();
    } else if (this.movementAngle === null) {
      this.startMovement();
    } else {
      this.setMovementAngle();
    }
  }

  private startMovement() {
    if (this.movementTarget === null) {
      return;
    }

    this.setMovementAngle();

    this.dustEffect?.emitter.start();

    this.scene.fx.playSound(PlayerAudio.WALK, {
      loop: true,
      rate: 1.8,
    });
  }

  public setMovementTarget(angle: Nullable<number>) {
    this.movementTarget = angle === null ? null : Math.round(angle / 45) % 8;
  }

  private setMovementAngle() {
    if (
      this.movementTarget === null
      || this.movementAngle === this.movementTarget * 45
    ) {
      return;
    }

    this.movementAngle = this.movementTarget * 45;

    this.updateMovementAnimation(true);
  }

  // ISSUE: [https://github.com/neki-dev/izowave/issues/81]
  // Error on Phaser animation play
  private updateMovementAnimation(restart: boolean = false) {
    if (this.movementTarget === null) {
      return;
    }

    try {
      const lastFrame = this.anims.currentFrame;

      this.anims.play({
        key: `dir_${this.movementTarget}`,
        startFrame: (restart || !lastFrame) ? 1 : lastFrame.index,
        frameRate: (this.stamina) === 0.0 ? 6 : 8,
      });
    } catch {
      //
    }
  }

  private stopMovement() {
    if (this.movementAngle === null) {
      return;
    }

    this.movementAngle = null;

    if (this.anims.currentAnim) {
      this.anims.setProgress(0);
      this.anims.stop();
    }

    this.dustEffect?.emitter.stop();

    this.scene.sound.stopByKey(PlayerAudio.WALK);
  }

  private addDustEffect() {
    if (this.dustEffect) {
      return;
    }

    this.dustEffect = this.scene.fx.createDustEffect(this);
  }

  private removeDustEffect() {
    if (!this.dustEffect) {
      return;
    }

    this.dustEffect.destroy();
    this.dustEffect = null;
  }

  private registerAnimations() {
    Array.from({ length: 8 }).forEach((_, index) => {
      this.anims.create({
        key: `dir_${index}`,
        frames: this.anims.generateFrameNumbers(PlayerTexture.PLAYER, {
          start: index * 4,
          end: (index + 1) * 4 - 1,
        }),
        frameRate: 8,
        repeat: -1,
      });
    });
  }

  private handleToggleEffects() {
    const handler = (enabled: boolean) => {
      if (enabled) {
        this.addDustEffect();
      } else {
        this.removeDustEffect();
      }
    };

    this.scene.game.events.on(`${GameEvent.UPDATE_SETTINGS}.${GameSettings.EFFECTS}`, handler);

    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      this.scene.game.events.off(`${GameEvent.UPDATE_SETTINGS}.${GameSettings.EFFECTS}`, handler);
    });
  }
}
