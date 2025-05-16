import Phaser from 'phaser';

import { EntityType } from '../types';

import { COIN_TILE } from './const';
import { CoinAudio, CoinTexture, CoinEvents } from './types';
import type { ICoin, CoinData } from './types';

import { DIFFICULTY } from '~game/difficulty';
import { Assets } from '~lib/assets';
import { ShaderType } from '~lib/shader/types';
import { Level } from '~scene/world/level';
import type { ITile } from '~scene/world/level/tile-matrix/types';
import type { PositionAtMatrix } from '~scene/world/level/types';
import { TileType } from '~scene/world/level/types';
import type { IWorld } from '~scene/world/types';

Assets.RegisterAudio(CoinAudio);
Assets.RegisterSprites(CoinTexture, COIN_TILE);

export class Coin extends Phaser.GameObjects.Image implements ICoin, ITile {
  readonly scene: IWorld;

  readonly tileType: TileType = TileType.COIN;

  readonly positionAtMatrix: PositionAtMatrix;

  constructor(scene: IWorld, {
    positionAtMatrix,
  }: CoinData) {
    const positionAtWorld = Level.ToWorldPosition(positionAtMatrix);

    super(scene, positionAtWorld.x, positionAtWorld.y, CoinTexture.COIN);
    scene.add.existing(this);
    scene.addEntityToGroup(this, EntityType.COIN);

    this.positionAtMatrix = positionAtMatrix;

    if (this.scene.game.isDesktop()) {
      this.setInteractive({
        pixelPerfect: true,
      });

      this.handlePointer();
    }

    this.setDepth(positionAtWorld.y);
    this.setOrigin(0.5, COIN_TILE.origin);
    this.scene.level.putTile(this, { ...positionAtMatrix, z: 1 });
  }

  public pickup() {
    const coins = DIFFICULTY.COINS_SIZE;

    this.scene.player.giveCoins(coins);

    this.scene.fx.playSound(CoinAudio.PICKUP);
    this.scene.getEntitiesGroup(EntityType.COIN)
      .emit(CoinEvents.PICKUP, this, coins);

    this.destroy();
  }

  private handlePointer() {
    this.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.addShader(ShaderType.OUTLINE, {
        size: 2.0,
        color: 0xffffff,
      });
    });

    this.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.removeShader(ShaderType.OUTLINE);
    });
  }
}
