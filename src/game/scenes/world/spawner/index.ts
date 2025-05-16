import { LiveEvent } from '../entities/addons/live/types';
import { EnemyFactory } from '../entities/npc/enemy/factory';
import type { IEnemy } from '../entities/npc/enemy/types';
import { EnemyVariant } from '../entities/npc/enemy/types';
import { EntityType } from '../entities/types';
import { Level } from '../level';
import { SpawnTarget } from '../level/types';
import type { PositionAtMatrix } from '../level/types';
import type { IWorld } from '../types';

import { SPAWNER_ENEMY_LEVEL_GROWTH, SPAWNER_ENEMY_LEVEL_GROWTH_RETARDATION_LEVEL, SPAWNER_MIN_SPACE_BETWEEN, SPAWNER_POSITIONS_GRID } from './const';
import type { ISpawner } from './types';

import { DIFFICULTY } from '~game/difficulty';
import { getDistance } from '~lib/dimension';
import { progressionQuadratic } from '~lib/progression';

export class Spawner implements ISpawner {
  private scene: IWorld;

  private readonly positions: PositionAtMatrix[] = [];

  constructor(scene: IWorld) {
    this.scene = scene;

    this.positions = this.scene.level.readSpawnPositions(
      SpawnTarget.ENEMY,
      SPAWNER_POSITIONS_GRID,
    );
  }

  public spawnDefaultEnemies() {
    for (let i = 0; i < DIFFICULTY.ENEMY_COUNT; i++) {
      this.spawnEnemy();
    }
  }

  public spawnEnemy() {
    const currentEnemies = this.scene.getEntities<IEnemy>(EntityType.ENEMY);
    const availablePositions = this.positions.filter((position) => {
      const positionAtWorld = Level.ToWorldPosition(position);
      return (
        !this.scene.camera.isVisible(positionAtWorld) &&
        currentEnemies.every((enemy) => (
          getDistance(enemy.positionAtMatrix, position) >= SPAWNER_MIN_SPACE_BETWEEN
        ))
      );
    });

    const positionAtMatrix = Phaser.Utils.Array.GetRandom(availablePositions);
    const level = this.getEnemyLevel();
    const variant = Phaser.Utils.Array.GetRandom(Object.values(EnemyVariant));

    const enemy = EnemyFactory.create(this.scene, variant, {
      level,
      positionAtMatrix,
    });

    enemy.live.once(LiveEvent.DEAD, () => {
      this.spawnEnemy();
    });

    return enemy;
  }

  private getEnemyLevel() {
    const livedTime = this.scene.player.getLivedTime();

    return progressionQuadratic({
      defaultValue: 1,
      scale: SPAWNER_ENEMY_LEVEL_GROWTH,
      level: Math.floor(livedTime / 60),
      retardationLevel: SPAWNER_ENEMY_LEVEL_GROWTH_RETARDATION_LEVEL,
      roundTo: 1,
    }) + 1;
  }
}
