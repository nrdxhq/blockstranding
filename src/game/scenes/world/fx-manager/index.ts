import type { IEnemy } from '../entities/npc/enemy/types';
import type { INPC } from '../entities/npc/types';
import type { IPlayer } from '../entities/player/types';
import type { ISprite } from '../entities/types';
import type { PositionAtWorld } from '../level/types';
import type { IWorld } from '../types';

import { Effect } from './effect';
import { EffectTexture } from './effect/types';
import { Particles } from './particles';
import type { IParticlesParent } from './particles/types';
import { ParticlesTexture } from './particles/types';
import type { IFXManager, SoundParams } from './types';

import { GameSettings } from '~game/types';

export class FXManager implements IFXManager {
  private scene: IWorld;

  constructor(scene: IWorld) {
    this.scene = scene;
  }

  public playSound(key: string | string[], params: SoundParams = {}) {
    try {
      const sound = typeof key === 'string' ? key : Phaser.Utils.Array.GetRandom(key);

      if (!params.limit || this.scene.sound.getAll(sound).length < params.limit) {
        this.scene.sound.play(sound, params);
      }
    } catch (error) {
      console.warn('Failed to play sound', error as TypeError);
    }
  }

  public createDustEffect(parent: IPlayer) {
    if (!this.isEffectsEnabled()) {
      return null;
    }

    return new Particles(parent, {
      key: 'dust',
      texture: ParticlesTexture.BIT,
      depth: 0,
      attach: true,
      params: {
        followOffset: {
          x: 0,
          y: -parent.gamut * parent.scaleY * 0.5,
        },
        lifespan: { min: 150, max: 300 },
        scale: 0.6,
        speed: 10,
        frequency: 150,
        alpha: { start: 1.0, end: 0.0 },
        emitting: false,
      },
    });
  }

  public createBloodEffect(parent: ISprite) {
    if (
      !parent.active
      || !this.isEffectsEnabled()
      || FXManager.IsExist(parent, 'blood')
    ) {
      return null;
    }

    const scale = Math.min(2.0, parent.displayWidth / 22);

    return new Particles(parent, {
      key: 'blood',
      texture: ParticlesTexture.BIT_SOFT,
      attach: true,
      params: {
        duration: 250,
        followOffset: parent.getBodyOffset(),
        lifespan: { min: 100, max: 250 },
        scale: { start: scale, end: scale * 0.25 },
        speed: 60,
        maxAliveParticles: 6,
        tint: 0xdd1e1e,
      },
    });
  }

  public createFrozeEffect(parent: INPC) {
    if (
      !parent.active
      || !this.isEffectsEnabled()
      || FXManager.IsExist(parent, 'froze')
    ) {
      return null;
    }

    const lifespan = Math.min(400, parent.displayWidth * 8);

    return new Particles(parent, {
      key: 'froze',
      texture: ParticlesTexture.BIT_SOFT,
      attach: true,
      params: {
        duration: lifespan,
        followOffset: parent.getBodyOffset(),
        color: [0xffffff, 0x8cf9ff, 0x00f2ff],
        colorEase: 'quad.out',
        lifespan: { min: lifespan / 2, max: lifespan },
        scale: { start: 1.0, end: 0.5 },
        speed: 80,
      },
    });
  }

  public createFireEffect(parent: IEnemy) {
    if (
      !parent.active
      || !this.isEffectsEnabled()
      || FXManager.IsExist(parent, 'fire')
    ) {
      return null;
    }

    const lifespan = parent.displayWidth * 6;
    const scale = Math.min(2.0, parent.displayWidth / 22);

    return new Particles(parent, {
      key: 'fire',
      texture: ParticlesTexture.BIT_SOFT,
      attach: true,
      params: {
        duration: lifespan,
        followOffset: parent.getBodyOffset(),
        color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
        colorEase: 'quad.out',
        lifespan: { min: lifespan / 2, max: lifespan },
        scale: { start: scale, end: scale * 0.2 },
        alpha: { start: 1.0, end: 0.0 },
        speed: 80,
      },
    });
  }

  public createLongFireEffect(parent: IEnemy, params: { duration: number }) {
    if (!parent.active || !this.isEffectsEnabled()) {
      return null;
    }

    const lifespan = parent.displayWidth * 25;

    return new Particles(parent, {
      key: 'long-fire',
      texture: ParticlesTexture.BIT_SOFT,
      attach: true,
      params: {
        followOffset: parent.getBodyOffset(),
        duration: params.duration,
        color: [0xfacc22, 0xf89800, 0xf83600, 0x9f0404],
        colorEase: 'quad.out',
        lifespan: { min: lifespan / 2, max: lifespan },
        alpha: { start: 1.0, end: 0.0 },
        angle: { min: -100, max: -80 },
        scale: {
          start: parent.displayWidth / 20,
          end: 1.0,
          ease: 'sine.out',
        },
        speed: 40,
        advance: 10,
      },
    });
  }

  public createLazerEffect(parent: IEnemy) {
    if (
      !parent.active
      || !this.isEffectsEnabled()
      || FXManager.IsExist(parent, 'lazer')
    ) {
      return null;
    }

    const lifespan = parent.displayWidth * 5;
    const scale = Math.min(2.25, parent.displayWidth / 18);

    return new Particles(parent, {
      key: 'lazer',
      texture: ParticlesTexture.BIT_SOFT,
      attach: true,
      params: {
        duration: lifespan,
        followOffset: parent.getBodyOffset(),
        lifespan: { min: lifespan / 2, max: lifespan },
        scale: { start: scale, end: scale * 0.2 },
        alpha: { start: 1.0, end: 0.0 },
        speed: 80,
        tint: 0xb136ff,
      },
    });
  }

  public createElectroEffect(parent: IEnemy) {
    if (
      !parent.active
      || !this.isEffectsEnabled()
      || FXManager.IsExist(parent, 'electro')
    ) {
      return null;
    }

    const lifespan = Math.min(500, parent.displayWidth * 12);
    const scale = Math.min(2.25, parent.displayWidth / 18);

    return new Particles(parent, {
      key: 'electro',
      texture: ParticlesTexture.BIT,
      attach: true,
      params: {
        duration: lifespan,
        followOffset: parent.getBodyOffset(),
        lifespan: { min: lifespan / 2, max: lifespan },
        scale: { start: scale, end: scale * 0.2 },
        alpha: { start: 0.75, end: 0.0 },
        speed: 120,
        maxParticles: 6,
        tint: 0xc9e7dd,
      },
    });
  }

  public createGlowEffect(parent: IParticlesParent, params: { speed: number; color: number }) {
    if (!parent.active || !this.isEffectsEnabled()) {
      return null;
    }

    return new Particles(parent, {
      key: 'glow',
      texture: ParticlesTexture.GLOW,
      attach: true,
      params: {
        scale: 0.2 * parent.scale,
        alpha: { start: 1.0, end: 0.0 },
        lifespan: 20000 / params.speed,
        frequency: 10000 / params.speed,
        tint: params.color,
        blendMode: 'ADD',
      },
    });
  }

  public createSpawnEffect(parent: IEnemy) {
    if (!this.isEffectsEnabled()) {
      return null;
    }

    const duration = Math.min(700, parent.displayHeight * 17);
    const scale = parent.displayWidth / 16;

    return new Particles(parent, {
      key: 'spawn',
      texture: ParticlesTexture.BIT_SOFT,
      position: {
        x: parent.x,
        y: parent.body.y,
      },
      depth: parent.depth - 1,
      params: {
        duration,
        lifespan: { min: duration / 2, max: duration },
        scale: { start: scale, end: scale / 2 },
        alpha: { start: 1.0, end: 0.0 },
        speed: 40,
        quantity: 1,
        tint: 0x000000,
      },
    });
  }

  public createHealEffect(parent: ISprite) {
    if (
      !this.isEffectsEnabled()
      || FXManager.IsExist(parent, 'heal')
    ) {
      return null;
    }

    return new Particles(parent, {
      key: 'heal',
      texture: ParticlesTexture.PLUS,
      attach: true,
      params: {
        followOffset: {
          x: 0,
          y: -parent.displayHeight,
        },
        duration: 500,
        lifespan: 500,
        alpha: { start: 1.0, end: 0.0 },
        angle: {
          min: -110,
          max: -70,
        },
        scale: {
          start: 1.0,
          end: 0.5,
        },
        speed: 20,
        maxAliveParticles: 1,
      },
    });
  }

  public createExplosionEffect(parent: ISprite) {
    if (!this.isEffectsEnabled()) {
      return null;
    }

    return new Effect(this.scene, {
      texture: EffectTexture.EXPLOSION,
      position: parent.body.center,
      depth: parent.depth + 1,
    });
  }

  public createBloodStainEffect(position: PositionAtWorld) {
    if (!this.isEffectsEnabled()) {
      return null;
    }

    return new Effect(this.scene, {
      texture: EffectTexture.BLOOD,
      position,
      staticFrame: Phaser.Math.Between(0, 3),
    });
  }

  private isEffectsEnabled() {
    return this.scene.game.isSettingEnabled(GameSettings.EFFECTS);
  }

  static IsExist(parent: IParticlesParent, key: string) {
    return Boolean(parent.effects?.[key]);
  }
}
