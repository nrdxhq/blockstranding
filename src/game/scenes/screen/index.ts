import { Interface } from 'phaser-react-ui';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick';

import { Scene } from '..';

import { ScreenUI } from './interface';
import { ScreenAudio, ScreenEvent, ScreenTexture } from './types';
import type { IScreen } from './types';

import { GameScene } from '~game/types';
import { Assets } from '~lib/assets';
import { INTERFACE_SCALE } from '~lib/interface/const';

Assets.RegisterAudio(ScreenAudio);
Assets.RegisterImages(ScreenTexture);

export class Screen extends Scene implements IScreen {
  private joystick: Nullable<VirtualJoystick> = null;

  private _joystickActivePointer: Nullable<Phaser.Input.Pointer> = null;
  public get joystickActivePointer() { return this._joystickActivePointer; }
  private set joystickActivePointer(v) { this._joystickActivePointer = v; }

  constructor() {
    super(GameScene.SCREEN);
  }

  public create() {
    const ui = new Interface(this);
    ui.render(ScreenUI);

    if (!this.game.isDesktop()) {
      this.createJoystick();
      this.createAttackButton();
    }
  }

  public update() {
    try {
      this.handleJoystick();
    } catch (error) {
      console.warn('Failed to update screen', error as TypeError);
    }
  }

  public failure(text?: string) {
    this.sound.play(ScreenAudio.ERROR);
    if (text) {
      this.events.emit(ScreenEvent.NOTICE, { text });
    }
  }

  private createAttackButton() {
    const button = this.add.circle(0, 0, 0, 0xffffff, 0.25);
    const icon = this.add.image(0, 0, ScreenTexture.ATTACK);

    button.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.game.world.player.attack();
    });

    const update = () => {
      const { padding, radius } = this.getControlsParams();
      const position = {
        x: this.game.canvas.width - padding - radius,
        y: this.game.canvas.height - padding - radius,
      };

      button.setRadius(radius);
      button.setPosition(position.x, position.y);
      button.setInteractive();

      icon.setPosition(position.x, position.y);
      icon.setScale(radius / 110);
    };

    update();

    this.scale.on(Phaser.Scale.Events.RESIZE, () => {
      update();
    });
  }

  private createJoystick() {
    const params = this.getJoystickParams();
    const base = this.add.circle(0, 0, params.radius, 0xffffff, 0.25);

    base.setInteractive();
    base.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      this.joystickActivePointer = pointer;
    });

    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActivePointer === pointer) {
        this.joystickActivePointer = null;
      }
    });

    this.scale.on(Phaser.Scale.Events.RESIZE, () => {
      const { x, y } = this.getJoystickParams();
      this.joystick?.setPosition(x, y);
    });

    this.joystick = new VirtualJoystick(this, {
      ...params,
      base,
      thumb: this.add.circle(0, 0, params.radius * 0.5, 0xffffff, 0.75),
    });
  }

  public isJoystickUsing() {
    if (!this.joystick) {
      return false;
    }

    return !this.joystick.noKey;
  }

  private handleJoystick() {
    if (!this.joystick) {
      return;
    }

    const angle = this.joystick.noKey
      ? null
      : (this.joystick.angle + 360) % 360;

    this.game.world.player.setMovementTarget(angle);
  }

  private getJoystickParams() {
    const { padding, radius } = this.getControlsParams();

    return {
      x: padding + radius,
      y: this.game.canvas.height - padding - radius,
      radius,
    };
  }

  private getAttackButtonParams() {
    const { padding, radius } = this.getControlsParams();

    return {
      x: this.game.canvas.width - padding - radius,
      y: this.game.canvas.height - padding - radius,
      radius,
    };
  }

  private getControlsParams() {
    const zoom = Math.max(
      Math.min(
        this.game.canvas.width / INTERFACE_SCALE.target,
        INTERFACE_SCALE.max,
      ),
      INTERFACE_SCALE.min,
    );

    return {
      padding: 40 * zoom,
      radius: 74 * zoom,
    };
  }
}
