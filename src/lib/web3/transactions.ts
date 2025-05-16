import type { AnchorProvider, Program } from '@coral-xyz/anchor';
import { web3 } from '@coral-xyz/anchor';

import {
  derivePlayerPda,
  isDelegatedToRollup,
  isMagicblockConnection,
  isSolanaAccountInitialized,
} from './helpers';
import type { GamePrototype, PlayerTransactionType } from './types';

export const populateSolanaStartGameTransaction = async ({
  programSolana,
  feePayer,
  playerAccount,
}: {
  programSolana: Program<GamePrototype>;
  feePayer: web3.PublicKey;
  playerAccount: web3.AccountInfo<Buffer> | null;
}): Promise<web3.Transaction> => {
  const provider = programSolana.provider as AnchorProvider;

  // Input validation
  const connection = provider.connection;
  if (connection.rpcEndpoint.includes('magicblock')) {
    throw new Error(
      'Passed wrong program to `createGame` function. Please change provider to solana connected',
    );
  }

  // Unexpected behavior. FE should prevent this.
  if (
    isSolanaAccountInitialized(playerAccount) &&
    isDelegatedToRollup(playerAccount)
  ) {
    throw new Error(
      'Player already exists on blockchain & delegated to rollup',
    );
  }

  // Construct transaction
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  console.log({
    feePayer: feePayer.toBase58(),
    blockhash,
    lastValidBlockHeight,
  });
  const tx = new web3.Transaction({
    feePayer,
    blockhash,
    lastValidBlockHeight,
  });

  if (!isSolanaAccountInitialized(playerAccount)) {
    // Если аккаунт еще не создан на блокчейне, то создаем его
    tx.add(
      await programSolana.methods
        .initializePlayer()
        .accounts({
          // @ts-ignore - TypeScript doesn't recognize Anchor's account structure correctly
          payer: provider.wallet.publicKey,
          player: derivePlayerPda(programSolana),
          systemProgram: web3.SystemProgram.programId,
        })
        .instruction(),
    );
    console.debug('`Instruction: Initialize player` added to transaction');
  }

  if (
    !isSolanaAccountInitialized(playerAccount) ||
    !isDelegatedToRollup(playerAccount)
  ) {
    // Если аккаунт еще не делегирован в rollup, то делегируем его
    const instruction = await programSolana.methods
      .delegate()
      .accounts({
        payer: provider.wallet.publicKey,
        // @ts-ignore - TypeScript doesn't recognize Anchor's account structure correctly
        player: derivePlayerPda(programSolana),
      })
      .instruction();
    tx.add(instruction);
    console.debug('`Instruction: Delegate` added to transaction');
  }

  // tx.partialSign(provider.wallet.payer);
  return tx;
};

export const populateRollupInGameActionTransaction = async (
  programs: {
    rollupProgram: Program<GamePrototype>;
  },
  type: PlayerTransactionType,
): Promise<web3.Transaction> => {
  // Input validation
  const connection = programs.rollupProgram.provider.connection;
  if (!isMagicblockConnection(connection))
    throw new Error(
      'Passed wrong program to `populateRollupInGameActionTransaction` function. Please change provider to rollup connected',
    );

  const program = programs.rollupProgram;
  const userWallet = program.provider.wallet;
  if (!userWallet) {
    throw new Error('User wallet is undefined');
  }

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = await program.methods
    // @ts-ignore - TypeScript doesn't recognize Anchor's account structure correctly
    .makeAction({ [type.toLowerCase()]: {} })
    .accounts({
      payer: userWallet.publicKey,
      // @ts-ignore - TypeScript doesn't recognize Anchor's account structure correctly
      player: derivePlayerPda(program),
      user: userWallet.publicKey,
    })
    .transaction();

  return new web3.Transaction({
    blockhash,
    lastValidBlockHeight,
  }).add(transaction);
};

export const populateRollupEndGameTransaction = async (programs: {
  rollupProgram: Program<GamePrototype>;
}): Promise<web3.Transaction> => {
  // Input validation
  const connection = programs.rollupProgram.provider.connection;
  if (!isMagicblockConnection(connection)) {
    throw new Error(
      'Passed wrong program in function. Please change provider to rollup connected',
    );
  }

  const program = programs.rollupProgram;
  const userWallet = program.provider.wallet;
  if (!userWallet) {
    throw new Error('User wallet is undefined');
  }

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = await program.methods
    .undelegate()
    .accounts({
      payer: userWallet.publicKey,
      // @ts-ignore - TypeScript doesn't recognize Anchor's account structure correctly
      player: derivePlayerPda(program),
    })
    .transaction();

  return new web3.Transaction({
    blockhash,
    lastValidBlockHeight,
  }).add(transaction);
};
