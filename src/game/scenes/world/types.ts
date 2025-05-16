import type Phaser from 'phaser';

import type { ICamera } from './camera/types';
import type { IAssistant } from './entities/npc/assistant/types';
import type { IPlayer } from './entities/player/types';
import type { EntityType, ISprite } from './entities/types';
import type { IFXManager } from './fx-manager/types';
import type { ILevel, PositionAtWorld } from './level/types';
import type { ISpawner } from './spawner/types';

import type { IScene } from '~scene/types';

export interface IWorld extends IScene {
  /**
   * Player.
   */
  readonly player: IPlayer

  /**
   * Player assistant.
   */
  readonly assistant: IAssistant

  /**
   * Enemy spawner.
   */
  readonly spawner: ISpawner

  /**
   * Particles and effects manager.
   */
  readonly fx: IFXManager

  /**
   * Level.
   */
  readonly level: ILevel

  /**
   * Camera.
   */
  readonly camera: ICamera

  /**
   * Delta time of frame update.
   */
  readonly deltaTime: number

  /**
   * Start world.
   */
  start(): void

  /**
   * Get lifecyle time.
   */
  getTime(): number

  /**
   * Get game lifecyle pause state.
   */
  isTimePaused(): boolean

  /**
   * Set game lifecyle pause state.
   * @param state - Pause state
   */
  setTimePause(state: boolean): void

  /**
   * Add entity to group.
   * @param gameObject - Entity
   * @param type - Group type
   */
  addEntityToGroup(gameObject: Phaser.GameObjects.GameObject, type: EntityType): void

  /**
   * Get entities group.
   */
  getEntitiesGroup(type: EntityType): Phaser.GameObjects.Group

  /**
   * Get entities list from group.
   */
  getEntities<T>(type: EntityType): T[]

  /**
   * Precalculate sprite position after specified time.
   * @param sprite - Sprite
   * @param seconds - Time in seconds
   */
  getFuturePosition(sprite: ISprite, seconds: number): PositionAtWorld

  /**
   * Add timer event.
   * @param params - Timer params
   */
  addProgression(params: WorldTimerParams): Phaser.Time.TimerEvent
}

export type WorldHint = {
  side: 'left' | 'right' | 'top' | 'bottom'
  label: string
  position: PositionAtWorld | (() => PositionAtWorld)
  unique?: boolean
};

export type WorldTimerParams = {
  frequence?: number
  duration: number
  onProgress?: (left: number, total: number) => void
  onComplete: () => void
};
