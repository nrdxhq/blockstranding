import Phaser from 'phaser';

import { CONTAINER_ID, DEBUG_MODS, AUDIO_VOLUME } from './const';
import { GameState, GameSettings, GameScene, GameEvent } from './types';
import type { IGame, GameStat } from './types';

import { registerShaders } from '~lib/shader';
import { Utils } from '~lib/utils';
import { Web3 } from '~lib/web3';
import { Gameover } from '~scene/gameover';
import { Menu } from '~scene/menu';
import { MenuPage } from '~scene/menu/types';
import { Screen } from '~scene/screen';
import type { IScreen } from '~scene/screen/types';
import { System } from '~scene/system';
import { World } from '~scene/world';
import type { IWorld } from '~scene/world/types';

export class Game extends Phaser.Game implements IGame {
  private _state: GameState = GameState.IDLE;
  public get state() { return this._state; }
  private set state(v) { this._state = v; }

  private _screen: IScreen;
  public get screen() { return this._screen; }
  private set screen(v) { this._screen = v; }

  private _world: IWorld;
  public get world() { return this._world; }
  private set world(v) { this._world = v; }

  private _settings: Record<GameSettings, boolean> = {
    [GameSettings.AUDIO]: true,
    [GameSettings.EFFECTS]: true,
    [GameSettings.SHOW_TRANSACTIONS]: true,
    [GameSettings.SHOW_DAMAGE]: true,
  };
  public get settings() { return this._settings; }
  private set settings(v) { this._settings = v; }

  private sessionsCount: number = 0;

  constructor() {
    super({
      scene: [System, World, Screen, Menu, Gameover],
      pixelArt: true,
      autoRound: true,
      parent: CONTAINER_ID,
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
      },
      fps: {
        target: 60,
        forceSetTimeOut: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: DEBUG_MODS.basic,
          fps: 60,
          gravity: { y: 0 },
        },
      },
    });

    this.readSettings();

    this.events.on(Phaser.Core.Events.READY, () => {
      registerShaders(this.renderer);

      this.screen = <IScreen> this.scene.getScene(GameScene.SCREEN);
      this.world = <IWorld> this.scene.getScene(GameScene.WORLD);

      this.sound.setVolume(AUDIO_VOLUME);
      this.sound.mute = !this.isSettingEnabled(GameSettings.AUDIO);
    });

    this.events.on(`${GameEvent.UPDATE_SETTINGS}.${GameSettings.AUDIO}`, (enabled: boolean) => {
      this.sound.mute = !enabled;
    });

    window.addEventListener('beforeunload', (event: Event) => {
      if (this.state === GameState.STARTED) {
        event.preventDefault();
        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        event.returnValue = 'Do you confirm to leave game?';
      }
    });

    window.addEventListener('contextmenu', (event: Event) => {
      event.preventDefault();
    });
  }

  public pauseGame() {
    if (this.state !== GameState.STARTED) {
      return;
    }

    this.setState(GameState.PAUSED);

    this.world.scene.pause();
    this.screen.scene.pause();

    this.scene.systemScene.scene.launch(GameScene.MENU, {
      defaultPage: this.isDesktop()
        ? MenuPage.CONTROLS
        : MenuPage.ABOUT_GAME,
    });
  }

  public resumeGame() {
    if (this.state !== GameState.PAUSED) {
      return;
    }

    this.setState(GameState.STARTED);

    this.scene.systemScene.scene.stop(GameScene.MENU);

    this.world.scene.resume();
    this.screen.scene.resume();
  }

  public async startGame() {
    if (this.state !== GameState.IDLE) {
      return;
    }

    await Web3.initialize();

    if (this.sessionsCount === 0) {
      this.triggerFullscreen();
    }

    this.sessionsCount++;

    this.world.scene.restart();

    this.world.events.once(Phaser.Scenes.Events.CREATE, async () => {
      this.setState(GameState.STARTED);

      this.scene.systemScene.scene.stop(GameScene.MENU);
      this.scene.systemScene.scene.launch(GameScene.SCREEN);

      this.world.start();
    });
  }

  public async stopGame(menu: boolean = true) {
    if (this.state === GameState.IDLE) {
      return;
    }

    if (this.state === GameState.STARTED) {
      await Web3.undelegate();
    }

    this.scene.systemScene.scene.stop(GameScene.SCREEN);
    this.scene.systemScene.scene.stop(GameScene.MENU);
    this.scene.systemScene.scene.stop(GameScene.GAMEOVER);

    this.setState(GameState.IDLE);

    if (menu) {
      this.world.scene.restart();
      this.scene.systemScene.scene.launch(GameScene.MENU, {
        defaultPage: MenuPage.START_GAME,
      });
    }
  }

  public restartGame() {
    if (this.state === GameState.IDLE) {
      return;
    }

    this.stopGame(false);
    this.startGame();
  }

  public finishGame() {
    if (this.state !== GameState.STARTED) {
      return;
    }

    Web3.undelegate();

    this.setState(GameState.FINISHED);

    this.events.emit(GameEvent.FINISH);

    const record = this.getRecordStat();
    const stat = this.getCurrentStat();

    this.writeBestStat(stat, record);

    this.scene.systemScene.scene.stop(GameScene.SCREEN);
    this.scene.systemScene.scene.launch(GameScene.GAMEOVER, { stat, record });
  }

  public toggleSystemPause(state: boolean) {
    this.events.emit(GameEvent.TOGGLE_PAUSE, state);

    if (state) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private setState(state: GameState) {
    if (this.state === state) {
      return;
    }

    const prevPauseState = this.state !== GameState.STARTED;
    const nextPauseState = state !== GameState.STARTED;

    this.state = state;

    if (prevPauseState !== nextPauseState) {
      this.events.emit(GameEvent.TOGGLE_PAUSE, nextPauseState);
    }
  }

  public isDesktop() {
    return this.device.os.desktop;
  }

  public updateSetting(key: GameSettings, value: boolean) {
    this.settings[key] = value;
    localStorage.setItem(`SETTINGS.${key}`, value ? 'on' : 'off');

    this.events.emit(`${GameEvent.UPDATE_SETTINGS}.${key}`, value);
  }

  public isSettingEnabled(key: GameSettings) {
    if (!this.isDesktop() && key === GameSettings.SHOW_DAMAGE) {
      return false;
    }

    return this.settings[key];
  }

  private readSettings() {
    Utils.EachObject(GameSettings, (key) => {
      const userValue = localStorage.getItem(`SETTINGS.${key}`);

      if (userValue) {
        this.settings[key] = userValue === 'on';
      }
    });
  }

  private triggerFullscreen() {
    if (this.scale.isFullscreen || this.isDesktop()) {
      return;
    }

    try {
      this.scale.startFullscreen();
    } catch {
      //
    }
  }

  public getRecordStat(): Nullable<GameStat> {
    try {
      const recordValue = localStorage.getItem('BEST_STAT');

      return recordValue && JSON.parse(recordValue);
    } catch {
      return null;
    }
  }

  private writeBestStat(stat: GameStat, record: Nullable<GameStat>) {
    const params = Object.keys(stat) as (keyof GameStat)[];
    const betterStat = params.reduce((curr, param) => ({
      ...curr,
      [param]: Math.max(stat[param], record?.[param] ?? 0),
    }), {});

    localStorage.setItem('BEST_STAT', JSON.stringify(betterStat));
  }

  private getCurrentStat(): GameStat {
    return {
      coins: this.world.player.coins,
      kills: this.world.player.kills,
      lived: this.world.player.getLivedTime() / 60,
    };
  }
}
