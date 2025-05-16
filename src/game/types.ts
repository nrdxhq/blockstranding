import type { IScreen } from '~scene/screen/types';
import type { IWorld } from '~scene/world/types';

export interface IGame extends Phaser.Game {
  /**
   * World scene.
   */
  readonly world: IWorld

  /**
   * Screen scene.
   */
  readonly screen: IScreen

  /**
   * Game state.
   */
  readonly state: GameState

  /**
   * Game settings.
   */
  readonly settings: Record<GameSettings, boolean>

  /**
   * Pause game.
   */
  pauseGame(): void

  /**
   * Resume game.
   */
  resumeGame(): void

  /**
   * Start new game.
   */
  startGame(): Promise<void>

  /**
   * Stop game.
   */
  stopGame(): Promise<void>

  /**
   * Restart game.
   */
  restartGame(): void

  /**
   * Finish game.
   */
  finishGame(): void

  /**
   * Get record stat from storage
   */
  getRecordStat(): Nullable<GameStat>

  /**
   * Set game settings value.
   * @param key - Settings key
   * @param value - New value
   */
  updateSetting(key: GameSettings, value: boolean): void

  /**
   * Check is setting enabled.
   * @param key - Settings key
   */
  isSettingEnabled(key: GameSettings): boolean

  /**
   * Change system pause state.
   * @param state - Paused
   */
  toggleSystemPause(state: boolean): void

  /**
   * Check platform is desktop.
   */
  isDesktop(): boolean
}

export enum GameScene {
  SYSTEM = 'SYSTEM',
  GAMEOVER = 'GAMEOVER',
  WORLD = 'WORLD',
  SCREEN = 'SCREEN',
  MENU = 'MENU',
}

export enum GameEvent {
  START = 'start',
  FINISH = 'finish',
  UPDATE_SETTINGS = 'update_settings',
  TOGGLE_PAUSE = 'toggle_pause',
}

export enum GameState {
  IDLE = 'IDLE',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  PAUSED = 'PAUSED',
}

export enum GameSettings {
  AUDIO = 'AUDIO',
  SHOW_DAMAGE = 'SHOW_DAMAGE',
  EFFECTS = 'EFFECTS',
  SHOW_TRANSACTIONS = 'SHOW_TRANSACTIONS',
}

export type GameStat = {
  coins: number
  kills: number
  lived: number
};

declare global {
  interface Window {
    GAME?: IGame
  }
}
