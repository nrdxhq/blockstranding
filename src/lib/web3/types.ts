import type { Program, web3 } from '@coral-xyz/anchor';

import type { GamePrototype } from './game-prototype';

export enum PlayerTransactionType {
  Attack = 'Attack',
  Move = 'Move',
}

export interface Player {
  publicKey: string;
  moveCounter: number;
  attackCounter: number;
}

export interface AppPrograms {
  rollup: Program<GamePrototype>;
  solana: Program<GamePrototype>;
  feePayer: web3.PublicKey;
}

export type { GamePrototype };
