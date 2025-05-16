import type { Idl } from '@coral-xyz/anchor';
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';

import { ROLLUP_RPC_HTTP_URL, ROLLUP_RPC_WS_URL, SOLANA_RPC_HTTP_URL, SOLANA_RPC_WS_URL } from './const';
import type { GamePrototype } from './game-prototype';
import programIdl from './program-idl.json';
import type { AppPrograms } from './types';
import { Wallet } from './wallet';

export const initInfrastructure = (
  userGameWalletKeypair: web3.Keypair,
  userBrowserWalletPubkey: web3.PublicKey,
): AppPrograms => {
  //! Uncomment it for backend usage
  // const programSolana = workspace
  //   .GamePrototype as Program<GamePrototype>;
  return {
    feePayer: userBrowserWalletPubkey,
    solana: new Program<GamePrototype>(
      programIdl as Idl,
      new AnchorProvider(
        new web3.Connection(SOLANA_RPC_HTTP_URL, {
          wsEndpoint: SOLANA_RPC_WS_URL,
        }),
        // @ts-ignore
        new Wallet(userGameWalletKeypair),
        { commitment: 'confirmed' },
      ),
    ),
    rollup: new Program<GamePrototype>(
      programIdl as Idl,
      new AnchorProvider(
        new web3.Connection(ROLLUP_RPC_HTTP_URL, {
          wsEndpoint: ROLLUP_RPC_WS_URL,
        }),
        // @ts-ignore
        new Wallet(userGameWalletKeypair),
        { commitment: 'confirmed' },
      ),
    ),
  };
};
