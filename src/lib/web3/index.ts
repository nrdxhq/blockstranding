import { Buffer } from 'buffer';

import type { AnchorProvider } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { toast } from 'react-toastify';

import { DELEGATION_PROGRAM_ID, WALLET_KEYPAIR_STORAGE_KEY } from './const';
import { initInfrastructure } from './factory';
import { fetchPlayerState } from './getters';
import {
  derivePlayerPda,
  isDelegatedToRollup,
  isSolanaAccountInitialized,
} from './helpers';
import {
  populateRollupEndGameTransaction,
  populateRollupInGameActionTransaction,
  populateSolanaStartGameTransaction,
} from './transactions';
import type { PlayerTransactionType } from './types';
import { Wallet } from './wallet';

if (!window.Buffer) {
  window.Buffer = Buffer;
}

export class Web3 {
  private static transactionsQueue: (() => Promise<void>)[] = [];

  private static transactionRunning: boolean = false;

  public static generateWalletKeypair() {
    const keypair = Keypair.generate();
    const secretKey = btoa(String.fromCharCode(...keypair.secretKey));
    localStorage.setItem(WALLET_KEYPAIR_STORAGE_KEY, secretKey);

    return keypair;
  }

  public static getWalletKeypair() {
    const currentKeypair = localStorage.getItem(WALLET_KEYPAIR_STORAGE_KEY);
    if (!currentKeypair) {
      return null;
    }

    const binary = atob(currentKeypair);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return Keypair.fromSecretKey(bytes);
  }

  public static async getWalletBalance() {
    const { wallet, providerSolana } = this.getProgramData();
    const balance = await providerSolana.connection.getBalance(
      wallet.publicKey,
    );
    return balance * 1e-9;
  }

  private static getProgramData() {
    const keypair = this.getWalletKeypair();
    if (!keypair) {
      throw new Error('Wallet keypair is undefined');
    }

    const programs = initInfrastructure(keypair, keypair.publicKey);

    return {
      wallet: new Wallet(keypair),
      programSolana: programs.solana,
      programRollup: programs.rollup,
      providerSolana: programs.solana.provider as AnchorProvider,
      providerRollup: programs.rollup.provider as AnchorProvider,
    };
  }

  public static async initialize() {
    const { wallet, programSolana, providerSolana } = this.getProgramData();

    const playerAccount =
      await programSolana.provider.connection.getAccountInfo(
        derivePlayerPda(programSolana),
      );

    if (
      isSolanaAccountInitialized(playerAccount) &&
      isDelegatedToRollup(playerAccount)
    ) {
      console.warn('⏭️ Account already initialized and delegated, skipping...');
      return;
    }

    // Transaction: populate with instructions
    const tx = await populateSolanaStartGameTransaction({
      playerAccount,
      programSolana,
      feePayer: wallet.publicKey,
    });

    // Transaction: sign by payer (user with browser wallet)
    // tx should be signed by payer after recentBlockhash and feePayer are set
    const signedTx = await wallet.signTransaction(tx);

    // Transaction: Send to blockchain
    const txHash = await providerSolana.sendAndConfirm(signedTx);
    console.log('[SOLANA] Init player txHash:', txHash);

    const playerState = await fetchPlayerState(programSolana);
    console.log('[SOLANA] Player state:', playerState);
  }

  public static async undelegate() {
    const { programSolana, providerSolana, programRollup, providerRollup } =
      this.getProgramData();

    // Check state on Solana
    const playerAccountInfo = await providerSolana.connection.getAccountInfo(
      derivePlayerPda(programSolana),
    );
    if (
      playerAccountInfo &&
      playerAccountInfo.owner.toBase58() != DELEGATION_PROGRAM_ID.toBase58()
    ) {
      console.log('⏭️ Player is not delegated. Skipping undelegating...');
      return;
    }

    const tx = await populateRollupEndGameTransaction({
      rollupProgram: programRollup,
    });

    // Transaction: Send to blockchain
    const txHash = await providerRollup.sendAndConfirm(tx);
    console.log('[SOLANA] Undelegate txHash:', txHash);
  }

  public static makeTransaction(type: PlayerTransactionType) {
    const runNextTransaction = async () => {
      if (this.transactionRunning) {
        return;
      }

      const runTransaction = this.transactionsQueue.shift();
      if (!runTransaction) {
        return;
      }

      try {
        this.transactionRunning = true;
        await runTransaction();
      } finally {
        this.transactionRunning = false;
        runNextTransaction();
      }
    };

    toast.info('TRANSACTION PENDING', {
      containerId: 'transactions',
      autoClose: 750,
    });

    this.transactionsQueue.push(() => this.callTransaction(type));

    runNextTransaction();
  }

  private static async callTransaction(type: PlayerTransactionType) {
    try {
      const { programRollup, providerRollup } = this.getProgramData();
      const tx = await populateRollupInGameActionTransaction(
        {
          rollupProgram: programRollup,
        },
        type,
      );

      // Transaction: send
      const txHash = await providerRollup.sendAndConfirm(tx, [], {
        commitment: 'processed',
      });
      console.log('[ROLLUP] Transaction', type, 'txHash:', txHash);

      this.showTransactionHash(txHash);
    } catch (error) {
      const message = (error as Error).message;
      console.error('[ROLLUP] Transaction', type, 'error:', message);
    }
  }

  private static showTransactionHash(txHash: string) {
    const minifiedTxHash =
      txHash.substring(0, 6) +
      '...' +
      txHash.substring(txHash.length - 7, txHash.length - 1);

    toast.success(`TRANSACTION SUCCESSFUL\n${minifiedTxHash}`, {
      containerId: 'transactions',
      autoClose: 750,
    });
  }
}
