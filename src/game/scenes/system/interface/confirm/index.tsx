import { useCurrentScene, useEvent } from 'phaser-react-ui';
import React, { useCallback } from 'react';

import { Button } from '../button';

import { Overlay, Container, Content, Buttons } from './styles';

type Props = {
  message: string
  onConfirm: () => void
  onClose: () => void
};

// TODO: Use with context
export const Confirm: React.FC<Props> = ({ message, onConfirm, onClose }) => {
  const scene = useCurrentScene();

  const handleConfirm = useCallback(() => {
    onClose();
    onConfirm();
  }, [onConfirm, onClose]);

  useEvent(scene.input.keyboard, 'keyup-ENTER', handleConfirm, [handleConfirm]);

  return (
    <Overlay>
      <Container>
        <Content>{message}</Content>
        <Buttons>
          <Button view="confirm" size="small" onClick={handleConfirm}>
            Yes
          </Button>
          <Button view="decline" size="small" onClick={onClose}>
            No
          </Button>
        </Buttons>
      </Container>
    </Overlay>
  );
};
