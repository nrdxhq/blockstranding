import { useGame } from 'phaser-react-ui';
import React, { useState } from 'react';

import { Modal } from './modal';

import type { IGame } from '~game/types';
import { Button } from '~scene/system/interface/button';

import { Wrapper } from './styles';

export const Skills: React.FC = () => {
  const game = useGame<IGame>();

  const [opened, setOpened] = useState(false);

  const onClick = () => {
    setOpened(true);
    game.toggleSystemPause(true);
  };

  const onClose = () => {
    setOpened(false);
    game.toggleSystemPause(false);
  };

  return (
    <>
      {opened && (
        <Modal onClose={onClose} />
      )}
      <Wrapper>
        <Button onClick={onClick} view={opened ? 'confirm' : undefined}>
          Skills
        </Button>
      </Wrapper>
    </>
  );
};
