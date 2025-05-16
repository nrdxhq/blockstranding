import type { IEnemy } from '../entities/npc/enemy/types';

export interface ISpawner {
  /**
   * Spawn enemy in random position.
   */
  spawnEnemy(): IEnemy

  /**
   * Spawn default enemies in random position.
   */
  spawnDefaultEnemies(): void
}
