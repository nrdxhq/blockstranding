import type { ILive } from '../addons/live/types';
import type { IEnemyTarget } from '../npc/enemy/types';
import type { ISprite } from '../types';

import type { PositionAtMatrix } from '~scene/world/level/types';

export interface IPlayer extends ISprite, IEnemyTarget {
  /**
   * Total number of killed enemies.
   */
  readonly kills: number

  /**
   * Player coins.
   */
  readonly coins: number

  /**
   * Health management.
   */
  readonly live: ILive

  /**
   * Levels of upgrades.
   */
  readonly upgradeLevel: Record<PlayerSkill, number>

  /**
   * Lived time in seconds.
   */
  getLivedTime(): number;

  /**
   * Upgrade player skill.
   */
  upgrade(type: PlayerSkill): void

  /**
   * Get coins amount need to upgrade.
   */
  getCoinsToUpgrade(type: PlayerSkill): number

  /**
   * Attack enemies.
   */
  attack(): void

  /**
   * Inremeting number of killed enemies.
   */
  incrementKills(): void

  /**
   * Give player coins.
   * @param amount - coins amount
   */
  giveCoins(amount: number): void

  /**
   * Take player coins.
   * @param amount - coins amount
   */
  takeCoins(amount: number): void

  /**
   * Set angle of target movement direction.
   * @param angle - Angle
   */
  setMovementTarget(angle: Nullable<number>): void
}

export enum PlayerTexture {
  PLAYER = 'player/player',
  ATTACK = 'player/attack',
}

export enum PlayerSkillIcon {
  MAX_HEALTH = 'player/skills/max_health',
  SPEED = 'player/skills/speed',
  STAMINA = 'player/skills/stamina',
  ATTACK_DAMAGE = 'player/skills/attack_damage',
  ATTACK_DISTANCE = 'player/skills/attack_distance',
  ASSISTANT_ATTACK_DAMAGE = 'player/skills/assistant_attack_damage',
  ASSISTANT_ATTACK_DISTANCE = 'player/skills/assistant_attack_distance',
  ASSISTANT_ATTACK_SPEED = 'player/skills/assistant_attack_speed',
}

export enum PlayerAudio {
  UPGRADE = 'player/upgrade',
  WALK = 'player/walk',
  DEAD = 'player/dead',
  DAMAGE_1 = 'player/damage_1',
  DAMAGE_2 = 'player/damage_2',
  DAMAGE_3 = 'player/damage_3',
  ATTACK = 'player/attack',
}

export enum PlayerSkillTarget {
  CHARACTER = 'CHARACTER',
  ASSISTANT = 'ASSISTANT',
}

export enum PlayerSkill {
  ATTACK_DAMAGE = 'ATTACK_DAMAGE',
  ATTACK_DISTANCE = 'ATTACK_DISTANCE',
  MAX_HEALTH = 'MAX_HEALTH',
  SPEED = 'SPEED',
  STAMINA = 'STAMINA',
  ASSISTANT_ATTACK_DAMAGE = 'ASSISTANT_ATTACK_DAMAGE',
  ASSISTANT_ATTACK_DISTANCE = 'ASSISTANT_ATTACK_DISTANCE',
  ASSISTANT_ATTACK_SPEED = 'ASSISTANT_ATTACK_SPEED',
}

export enum PlayerEvent {
  UPGRADE_SKILL = 'upgrade_skill',
  UPDATE_COINS = 'update_coins',
}

export enum MovementDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export type PlayerData = {
  positionAtMatrix: PositionAtMatrix
};

export type PlayerSkillInfo = {
  coins: number
  target: PlayerSkillTarget
};

export type PlayerSkillData = {
  coins: number
  type: PlayerSkill
  currentLevel: number
};
