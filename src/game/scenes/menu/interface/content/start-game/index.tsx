import { useGame } from 'phaser-react-ui';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { WalletField } from './wallet-field';

import { Section } from '~game/scenes/system/interface/section';
import type { IGame } from '~game/types';
import { Web3 } from '~lib/web3';
import { WALLET_MIN_BALANCE_TO_PLAY } from '~lib/web3/const';

import { Wrapper, Button, Balance, Alert, Footer, Loading } from './styles';

export const StartGame: React.FC = () => {
  const game = useGame<IGame>();

  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletKeypair, setWalletKeypair] = useState(() =>
    Web3.getWalletKeypair(),
  );
  const [balance, setBalance] = useState(0);

  const normalizedBalance =
    String(balance).length > 7 ? balance.toFixed(5) : String(balance);

  const handleClickStart = () => {
    if (!walletKeypair) {
      return;
    }

    setLoading(true);

    new Promise((resolve) => setTimeout(resolve, 1500))
      .then(() => Web3.getWalletBalance())
      .then(async (currentBalance) => {
        setBalance(currentBalance);

        await game.startGame();
      })
      .catch((error) => {
        toast.error(error.message, {
          autoClose: 5000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClickGenerateWallet = () => {
    if (walletKeypair) {
      return;
    }

    const keypair = Web3.generateWalletKeypair();
    setWalletKeypair(keypair);

    const key = btoa(String.fromCharCode(...keypair.secretKey));
    setPrivateKey(key);
  };

  useEffect(() => {
    if (walletKeypair) {
      Web3.getWalletBalance().then(setBalance);
    }
  }, [walletKeypair]);

  return (
    <Wrapper>
      <Section direction="vertical" gap={32}>
        <Section direction="vertical">
          All game actions are recorded onchain as transactions with zero fees.
          <br />
          Made possible by MagicBlock, a breakthrough Solana tech with 10ms
          latency.
        </Section>
        {walletKeypair ? (
          <>
            <Section direction="vertical" gap={20}>
              <WalletField
                label="Your wallet"
                value={walletKeypair.publicKey.toString()}
                placeholder={`Fund your wallet with at least ${WALLET_MIN_BALANCE_TO_PLAY} SOL to start playing.`}
              />
              {privateKey && (
                <Section direction="vertical" gap={5}>
                  <WalletField label="Private key" value={privateKey} />
                  <Alert>
                    Make sure to save your private key. It won't be shown again.
                  </Alert>
                </Section>
              )}
            </Section>
          </>
        ) : (
          <Section direction="vertical">
            To start playing, create a wallet
          </Section>
        )}
      </Section>
      <Footer>
        {walletKeypair && (
          <Section direction="vertical">
            <Balance>
              <Balance.Label>Wallet balance:</Balance.Label>
              <Balance.Amount>{normalizedBalance} SOL</Balance.Amount>
            </Balance>
          </Section>
        )}
        <Section direction="vertical" gap={16}>
          {!walletKeypair && (
            <Button onClick={handleClickGenerateWallet}>Create wallet</Button>
          )}
          <Button onClick={handleClickStart} $disabled={!walletKeypair}>
            {loading && <Loading />}
            Start game
          </Button>
        </Section>
      </Footer>
    </Wrapper>
  );
};
