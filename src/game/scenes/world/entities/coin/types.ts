import type Phaser from 'phaser';

import type { PositionAtMatrix, PositionAtWorld } from '~scene/world/level/types';
import type { IWorld } from '~scene/world/types';

export interface ICoin extends Phaser.GameObjects.Image {
  readonly scene: IWorld

  /**
   * Position at matrix.
   */
  readonly positionAtMatrix: PositionAtMatrix

  /**
   * Take resources from coin and destroy him.
   */
  pickup(): void
}

export enum CoinTexture {
  COIN = 'coin/coin',
}

export enum CoinAudio {
  PICKUP = 'coin/pickup',
}

export enum CoinEvents {
  PICKUP = 'pickup',
}

export type CoinData = {
  positionAtMatrix: PositionAtMatrix
};

export type CoinAmount = {
  position: PositionAtWorld
  value: number
};
