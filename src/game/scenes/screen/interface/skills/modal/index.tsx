import { useClick, useCurrentScene, useEvent } from 'phaser-react-ui';
import React, { useRef } from 'react';

import { Item } from './item';

import { Utils } from '~lib/utils';
import { PLAYER_SKILLS } from '~scene/world/entities/player/const';
import { PlayerSkillTarget } from '~scene/world/entities/player/types';

import { Container, Groups, Group, Target, List, Backdrop, Overlay, Close } from './styles';

type Props = {
  onClose: () => void
};

export const Modal: React.FC<Props> = ({ onClose }) => {
  const scene = useCurrentScene();

  const refOverlay = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const refClose = useRef<HTMLDivElement>(null);

  useClick(refContainer, 'down', () => {}, []);
  useClick(refClose, 'down', onClose, []);
  useClick(refOverlay, 'down', onClose, []);

  useEvent(scene.input.keyboard, 'keyup-ESC', onClose, []);

  return (
    <>
      <Backdrop />
      <Overlay ref={refOverlay}>
        <Container ref={refContainer}>
          <Close ref={refClose}>Close</Close>
          <Groups>
            {Utils.MapObject(PlayerSkillTarget, (key, target) => (
              <Group key={key}>
                <Target>{target}</Target>
                <List>
                  {Utils.MapObject(PLAYER_SKILLS, (type, skill) => skill.target === target && (
                    <Item key={type} type={type} />
                  ))}
                </List>
              </Group>
            ))}
          </Groups>
        </Container>
      </Overlay>
    </>
  );
};
