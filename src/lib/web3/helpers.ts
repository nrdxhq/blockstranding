import type { Program } from '@coral-xyz/anchor';
import { web3 } from '@coral-xyz/anchor';

import { DELEGATION_PROGRAM_ID, ROLLUP_RPC_HTTP_URL, SOLANA_RPC_HTTP_URL } from './const';
import type { GamePrototype } from './types';

// INFRASTRUCTURE RELATED HELPERS
export const isMagicblockConnection = (
  connection: web3.Connection,
): boolean => {
  return connection.rpcEndpoint === ROLLUP_RPC_HTTP_URL;
};

export const isSolanaConnection = (connection: web3.Connection): boolean => {
  return connection.rpcEndpoint === SOLANA_RPC_HTTP_URL;
};

// PLAYER ACCOUNT RELATED HELPERS
export const isDelegatedToRollup = (
  account: web3.AccountInfo<Buffer> | null,
): boolean => {
  return Boolean(account?.owner.equals(DELEGATION_PROGRAM_ID));
};

export const isSolanaAccountInitialized = (
  account: web3.AccountInfo<Buffer> | null,
): boolean => {
  return account !== null;
};

// PROGRAM RELATED HELPERS
export const derivePlayerPda = (
  program: Program<GamePrototype>,
): web3.PublicKey => {
  const userWallet = program.provider.wallet;
  if (!userWallet) {
    throw new Error('User wallet is undefined');
  }

  const [playerPda] = web3.PublicKey.findProgramAddressSync(
    [userWallet.publicKey.toBuffer()],
    program.programId,
  );
  return playerPda;
};
