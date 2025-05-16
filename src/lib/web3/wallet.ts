import type { Keypair, PublicKey, Transaction } from '@solana/web3.js';

export class Wallet {
  public readonly publicKey: PublicKey;

  public readonly keypair: Keypair;

  constructor(keypair: Keypair) {
    this.keypair = keypair;
    this.publicKey = keypair.publicKey;
  }

  public async signTransaction(tx: Transaction) {
    tx.partialSign(this.keypair);
    return tx;
  }

  public async signAllTransactions(txs: Transaction[]) {
    return txs.map((tx) => {
      tx.partialSign(this.keypair);
      return tx;
    });
  }
}
