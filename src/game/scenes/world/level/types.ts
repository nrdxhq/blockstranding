import type { World, WorldBiomeParams } from 'gen-biome';

import type { Effect } from '../fx-manager/effect';
import type { IWorld } from '../types';

import type { ITileMatrix } from './tile-matrix/types';

import type { INavigator } from '~lib/navigator/types';

export interface ILevel extends ITileMatrix {
  readonly scene: IWorld

  /**
   * Path finder.
   */
  readonly navigator: INavigator

  /**
   * Map manager.
   */
  readonly map: World<LevelBiome>

  /**
   * Planet type.
   */
  readonly planet: LevelPlanet

  /**
   * Effects on ground.
   */
  readonly effectsOnGround: Effect[]

  /**
   * Tilemap ground layer.
   */
  readonly groundLayer: Phaser.Tilemaps.TilemapLayer

  /**
   * Collide grid for navigation.
   */
  readonly gridCollide: boolean[][]

  /**
   * Solid grid for navigation.
   */
  readonly gridSolid: boolean[][]

  /**
   * Let loose map tiles effects.
   */
  looseEffects(): void

  /**
   * Get spawn positions at matrix.
   * @param target - Spawn target
   * @param grid - Grid size
   */
  readSpawnPositions(target: SpawnTarget, grid?: number): PositionAtMatrix[]

  /**
   * Check is presence of map tile between world positions.
   * @param positionA - Position at world
   * @param positionB - Position at world
   */
  hasTilesBetweenPositions(positionA: PositionAtWorld, positionB: PositionAtWorld): boolean

  /**
   * Get biome by type.
   * @param type - Type
   */
  getBiome(type: BiomeType): Nullable<LevelBiome>

  /**
   * Get free adjacent tiles around source position.
   * @param position - Source position
   */
  getFreeAdjacentTiles(position: PositionAtMatrix): PositionAtMatrix[]
}

export enum TileType {
  MAP = 'MAP',
  COIN = 'COIN',
  SCENERY = 'SCENERY',
}

export enum SpawnTarget {
  ENEMY = 'ENEMY',
  PLAYER = 'PLAYER',
  SCENERY = 'SCENERY',
  COIN = 'COIN',
}

export type LevelBiomes = Array<{
  params?: WorldBiomeParams
  data: LevelBiome
}>;

export type LevelBiome = {
  type: BiomeType
  tileIndex: number | [number, number]
  z: number
  collide: boolean
  solid: boolean
  friction?: number
  spawn: SpawnTarget[]
};

export type LevelData = {
  planet?: LevelPlanet
  seed?: number[]
};

export enum LevelPlanet {
  EARTH = 'EARTH',
  MOON = 'MOON',
  MARS = 'MARS',
}

export enum LevelSceneryTexture {
  EARTH = 'level/earth/scenery',
  MOON = 'level/moon/scenery',
  MARS = 'level/mars/scenery',
}

export enum LevelTilesetTexture {
  EARTH = 'level/earth/tiles',
  MOON = 'level/moon/tiles',
  MARS = 'level/mars/tiles',
}

export enum BiomeType {
  WATER = 'WATER',
  SAND = 'SAND',
  GRASS = 'GRASS',
  RUBBLE = 'RUBBLE',
  MOUNT = 'MOUNT',
  SNOW = 'SNOW',
}

export type PositionAtWorld = {
  x: number
  y: number
};

export type PositionAtWorldTransform = PositionAtWorld & {
  getBottomEdgePosition?: () => PositionAtWorld
};

export type PositionAtMatrix = {
  x: number
  y: number
};

export type TilePosition = {
  x: number
  y: number
  z: number
};
