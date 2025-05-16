import { PlayerSkill, PlayerSkillTarget, MovementDirection } from './types';
import type { PlayerSkillInfo } from './types';

import { DIFFICULTY } from '~game/difficulty';

export const PLAYER_TILE_SIZE = {
  width: 20,
  height: 30,
  gamut: 4,
};

export const PLAYER_MAX_SKILL_LEVEL = 10;

export const PLAYER_SKILLS: Record<PlayerSkill, PlayerSkillInfo> = {
  [PlayerSkill.MAX_HEALTH]: {
    coins: DIFFICULTY.PLAYER_HEALTH_COINS_TO_UPGRADE,
    target: PlayerSkillTarget.CHARACTER,
  },
  [PlayerSkill.SPEED]: {
    coins: DIFFICULTY.PLAYER_SPEED_COINS_TO_UPGRADE,
    target: PlayerSkillTarget.CHARACTER,
  },
  [PlayerSkill.STAMINA]: {
    coins: DIFFICULTY.PLAYER_STAMINA_COINS_TO_UPGRADE,
    target: PlayerSkillTarget.CHARACTER,
  },
  [PlayerSkill.ATTACK_DAMAGE]: {
    coins: DIFFICULTY.PLAYER_ATTACK_DAMAGE_COINS_TO_UPGRADE,
    target: PlayerSkillTarget.CHARACTER,
  },
  [PlayerSkill.ATTACK_DISTANCE]: {
    coins: DIFFICULTY.PLAYER_ATTACK_DISTANCE_COINS_TO_UPGRADE,
    target: PlayerSkillTarget.CHARACTER,
  },
  [PlayerSkill.ASSISTANT_ATTACK_DAMAGE]: {
    coins: DIFFICULTY.ASSISTANT_ATTACK_DAMAGE_COINS_TO_UPGRADE,
    target: PlayerSkillTarget.ASSISTANT,
  },
  [PlayerSkill.ASSISTANT_ATTACK_DISTANCE]: {
    coins: DIFFICULTY.ASSISTANT_ATTACK_DISTANCE_COINS_TO_UPGRADE,
    target: PlayerSkillTarget.ASSISTANT,
  },
  [PlayerSkill.ASSISTANT_ATTACK_SPEED]: {
    coins: DIFFICULTY.ASSISTANT_ATTACK_PAUSE_COINS_TO_UPGRADE,
    target: PlayerSkillTarget.ASSISTANT,
  },
};

export const PLAYER_MOVEMENT_KEYS: Record<string, MovementDirection> = {
  KeyW: MovementDirection.UP,
  ArrowUp: MovementDirection.UP,
  KeyS: MovementDirection.DOWN,
  ArrowDown: MovementDirection.DOWN,
  KeyA: MovementDirection.LEFT,
  ArrowLeft: MovementDirection.LEFT,
  KeyD: MovementDirection.RIGHT,
  ArrowRight: MovementDirection.RIGHT,
};
