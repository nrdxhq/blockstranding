import type Phaser from 'phaser';

import type { IScene } from '~scene/types';

export interface IScreen extends IScene {
  /**
   * Joystick active pointer.
   */
  readonly joystickActivePointer: Nullable<Phaser.Input.Pointer>

  /**
   * Get state of using virtual joystick.
   */
  isJoystickUsing(): boolean

  /**
   * Send failure message.
   * @param text - Text
   */
  failure(text?: string): void
}

export enum ScreenAudio {
  ERROR = 'interface/error',
}

export enum ScreenTexture {
  ATTACK = 'hud/attack',
}

export enum ScreenEvent {
  NOTICE = 'notice',
}

export type Notice = {
  text: string
  timer: NodeJS.Timeout
};
