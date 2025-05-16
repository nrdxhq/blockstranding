import Phaser from 'phaser';
import { Interface } from 'phaser-react-ui';

import { Scene } from '..';

import { Camera } from './camera';
import type { ICamera } from './camera/types';
import { LiveEvent } from './entities/addons/live/types';
import { Coin } from './entities/coin';
import { CoinEvents } from './entities/coin/types';
import { Assistant } from './entities/npc/assistant';
import type { IAssistant } from './entities/npc/assistant/types';
import { Player } from './entities/player';
import type { IPlayer } from './entities/player/types';
import { EntityType } from './entities/types';
import type { ISprite } from './entities/types';
import { FXManager } from './fx-manager';
import type { IFXManager } from './fx-manager/types';
import { WorldUI } from './interface';
import { Level } from './level';
import { SpawnTarget } from './level/types';
import type { ILevel, LevelData, PositionAtWorld } from './level/types';
import { Spawner } from './spawner';
import type { ISpawner } from './spawner/types';
import type { IWorld, WorldTimerParams } from './types';

import { DIFFICULTY } from '~game/difficulty';
import { GameScene, GameState } from '~game/types';
import { aroundPosition } from '~lib/dimension';

export class World extends Scene implements IWorld {
  private entityGroups: Record<EntityType, Phaser.GameObjects.Group>;

  private lifecyle: Phaser.Time.TimerEvent;

  private _deltaTime: number = 1;
  public get deltaTime() { return this._deltaTime; }
  private set deltaTime(v) { this._deltaTime = v; }

  private _player: IPlayer;
  public get player() { return this._player; }
  private set player(v) { this._player = v; }

  private _assistant: IAssistant;
  public get assistant() { return this._assistant; }
  private set assistant(v) { this._assistant = v; }

  private _level: ILevel;
  public get level() { return this._level; }
  private set level(v) { this._level = v; }

  private _spawner: ISpawner;
  public get spawner() { return this._spawner; }
  private set spawner(v) { this._spawner = v; }

  private _fx: IFXManager;
  public get fx() { return this._fx; }
  private set fx(v) { this._fx = v; }

  private _camera: ICamera;
  public get camera() { return this._camera; }
  private set camera(v) { this._camera = v; }

  constructor() {
    super(GameScene.WORLD);
  }

  public create(data: LevelData) {
    this.input.setPollAlways();

    this.level = new Level(this, data);
    this.fx = new FXManager(this);
    this.camera = new Camera(this);
    this.spawner = new Spawner(this);

    this.addEntityGroups();
  }

  public start() {
    const ui = new Interface(this);
    ui.render(WorldUI);

    this.addLifecycle();
    this.addPlayer();
    this.addAssistant();
    this.addCoins();

    // this.camera.addZoomControl();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.spawner.spawnDefaultEnemies();
      },
    });
  }

  public update(time: number, delta: number) {
    if (this.game.state !== GameState.STARTED) {
      return;
    }

    try {
      this.deltaTime = delta;
    } catch (error) {
      console.warn('Failed to update world', error as TypeError);
    }
  }

  public getTime() {
    return Math.floor(this.lifecyle.getElapsed());
  }

  public isTimePaused() {
    return this.lifecyle.paused;
  }

  public setTimePause(state: boolean) {
    this.lifecyle.paused = state;
  }

  public addProgression(params: WorldTimerParams) {
    const delay = params.frequence ?? 50;
    const repeat = Math.ceil(params.duration / delay);
    const timer = this.time.addEvent({
      delay,
      repeat,
      callback: () => {
        const left = timer.getRepeatCount() - 1;

        if (params.onProgress) {
          params.onProgress?.(left, repeat);
        }
        if (left <= 0) {
          params.onComplete();
          timer.destroy();
        }
      },
    });

    return timer;
  }

  public addEntityToGroup(gameObject: Phaser.GameObjects.GameObject, type: EntityType) {
    this.entityGroups[type].add(gameObject);
  }

  public getEntitiesGroup(type: EntityType) {
    return this.entityGroups[type];
  }

  public getEntities<T = Phaser.GameObjects.GameObject>(type: EntityType) {
    return this.entityGroups[type].getChildren() as T[];
  }

  public getFuturePosition(sprite: ISprite, seconds: number): PositionAtWorld {
    const fps = this.game.loop.actualFps;
    const drag = 0.3 ** (1 / fps);
    const per = 1 - drag ** (seconds * fps);
    const offset = {
      x: ((sprite.body.velocity.x / fps) * per) / (1 - drag),
      y: ((sprite.body.velocity.y / fps) * per) / (1 - drag),
    };

    return {
      x: sprite.body.center.x + offset.x,
      y: sprite.body.center.y + offset.y,
    };
  }

  private addEntityGroups() {
    this.entityGroups = {
      [EntityType.COIN]: this.add.group(),
      [EntityType.NPC]: this.add.group(),
      [EntityType.ENEMY]: this.add.group(),
      [EntityType.SHOT]: this.add.group({
        runChildUpdate: true,
      }),
      [EntityType.SPRITE]: this.add.group({
        runChildUpdate: true,
      }),
    };
  }

  private addLifecycle() {
    this.lifecyle = this.time.addEvent({
      delay: Number.MAX_SAFE_INTEGER,
      loop: true,
      startAt: 0,
    });
  }

  private addPlayer() {
    const positionAtMatrix = Phaser.Utils.Array.GetRandom(
      this.level.readSpawnPositions(SpawnTarget.PLAYER),
    );

    this.player = new Player(this, { positionAtMatrix });

    this.camera.focusOn(this.player);

    this.player.live.on(LiveEvent.DEAD, () => {
      this.camera.zoomOut();
      this.game.finishGame();
    });
  }

  private addAssistant() {
    const positionAtMatrix = aroundPosition(this.player.positionAtMatrix).find((spawn) => {
      const biome = this.level.map.getAt(spawn);

      return biome?.solid;
    });

    this.assistant = new Assistant(this, {
      owner: this.player,
      positionAtMatrix: positionAtMatrix || this.player.positionAtMatrix,
      speed: this.player.speed,
    });
  }

  private addCoins() {
    const positions = this.level.readSpawnPositions(SpawnTarget.COIN);

    const spawn = () => {
      const freePositions = positions.filter((position) => this.level.isFreePoint({ ...position, z: 1 }));
      new Coin(this, {
        positionAtMatrix: Phaser.Utils.Array.GetRandom(freePositions),
      });
    };

    for (let i = 0; i < DIFFICULTY.COINS_COUNT; i++) {
      spawn();
    }

    this.getEntitiesGroup(EntityType.COIN).on(CoinEvents.PICKUP, () => {
      this.time.addEvent({
        delay: DIFFICULTY.COINS_RESPAWN_DURATION,
        callback: spawn,
      });
    });
  }
}
