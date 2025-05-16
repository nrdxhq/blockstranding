import type { Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

import * as PROGRAM_IDL from './program-idl.json';

export const DELEGATION_PROGRAM_ID = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');

export const WALLET_MIN_BALANCE_TO_PLAY = 0.01;

export const WALLET_KEYPAIR_STORAGE_KEY = 'WALLET_KEYPAIR';

export const ROLLUP_RPC_HTTP_URL = 'https://blockstranding.magicblock.app/';
export const ROLLUP_RPC_WS_URL = 'https://blockstranding.magicblock.app/';

export const SOLANA_RPC_HTTP_URL =
  'https://hortense-21a306-fast-mainnet.helius-rpc.com';
export const SOLANA_RPC_WS_URL =
  'wss://mainnet.helius-rpc.com/?api-key=e6a365f5-ea3e-4fbf-ac88-e392a71787c9';

export const GAME_PROTOTYPE_PROGRAM_ID = (PROGRAM_IDL as Idl).address;
console.log('GAME_PROTOTYPE_PROGRAM_ID:', GAME_PROTOTYPE_PROGRAM_ID);
