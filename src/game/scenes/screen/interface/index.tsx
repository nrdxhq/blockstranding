import { useGame, useMobilePlatform, useRelativeScale } from 'phaser-react-ui';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import { Debug } from './debug';
import { Notices } from './notices';
import { PlayerHUD } from './player-hud';
import { Skills } from './skills';

import { GameEvent, GameSettings, type IGame } from '~game/types';
import { INTERFACE_SCALE } from '~lib/interface/const';
import { Section } from '~scene/system/interface/section';

import { Column, Grid, Wrapper } from './styles';

export const ScreenUI: React.FC = () => {
  const game = useGame<IGame>();
  const refScale = useRelativeScale<HTMLDivElement>(INTERFACE_SCALE);
  const mobile = useMobilePlatform();

  const [showTransactions, setShowTransactions] = useState(() =>
    game.isSettingEnabled(GameSettings.SHOW_TRANSACTIONS),
  );

  useEffect(() => {
    game.events.on(
      `${GameEvent.UPDATE_SETTINGS}.${GameSettings.SHOW_TRANSACTIONS}`,
      setShowTransactions,
    );

    return () => {
      game.events.off(
        `${GameEvent.UPDATE_SETTINGS}.${GameSettings.SHOW_TRANSACTIONS}`,
        setShowTransactions,
      );
    };
  });

  return (
    <>
      {(showTransactions && !mobile) && (
        <ToastContainer
          limit={5}
          theme='dark'
          position='bottom-right'
          containerId="transactions"
          className="transactions-toast"
          closeButton={false}
          hideProgressBar={true}
        />
      )}
      <Wrapper ref={refScale}>
        <Grid>
          <Column $side="left">
            <Section direction="vertical" gap={8}>
              <PlayerHUD />
              <Skills />
            </Section>
            <Debug />
          </Column>
          <Column $side="center">
            <Notices />
          </Column>
          <Column $side="right"></Column>
        </Grid>
      </Wrapper>
    </>
  );
};

ScreenUI.displayName = 'ScreenUI';
