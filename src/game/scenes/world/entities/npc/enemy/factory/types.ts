import type { EnemyVariantData, IEnemy } from '../types';

import type { IWorld } from '~scene/world/types';

export interface IEnemyFactory {
  new (scene: IWorld, data: EnemyVariantData): IEnemy
}
