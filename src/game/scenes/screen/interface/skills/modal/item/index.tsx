import { Texture, useClick, useEvent, useScene } from 'phaser-react-ui';
import React, { useMemo, useRef, useState } from 'react';

import { GameScene } from '~game/types';
import { Cost } from '~scene/system/interface/cost';
import { PLAYER_MAX_SKILL_LEVEL } from '~scene/world/entities/player/const';
import type { PlayerSkill, PlayerSkillData } from '~scene/world/entities/player/types';
import { PlayerEvent, PlayerSkillIcon } from '~scene/world/entities/player/types';
import type { IWorld } from '~scene/world/types';

import {
  Container, Info, Action, Label, Level, Button, Limit, Icon, Head,
} from './styles';

type Props = {
  type: PlayerSkill
};

export const Item: React.FC<Props> = ({ type }) => {
  const world = useScene<IWorld>(GameScene.WORLD);

  const refContainer = useRef<HTMLDivElement>(null);

  const getData = (): PlayerSkillData => ({
    type,
    coins: world.player.getCoinsToUpgrade(type),
    currentLevel: world.player.upgradeLevel[type],
  });

  const [data, setData] = useState(getData);

  const levels = useMemo(() => Array.from({
    length: PLAYER_MAX_SKILL_LEVEL,
  }), []);

  useClick(refContainer, 'down', () => {
    world.player.upgrade(type);
  }, [type]);

  useEvent(world.player, PlayerEvent.UPGRADE_SKILL, () => {
    setData(getData());
  }, []);

  return (
    <Container ref={refContainer} $active={data.currentLevel < PLAYER_MAX_SKILL_LEVEL }>
      <Info>
        <Icon>
          <Texture name={PlayerSkillIcon[data.type]} />
        </Icon>
        <Head>
          <Label>{data.type.replace(/_/g, ' ').replace('ASSISTANT ', '')}</Label>
          <Level>
            {levels.map((_, level) => (
              <Level.Progress
                key={level}
                $active={data.currentLevel && level < data.currentLevel}
              />
            ))}
          </Level>
        </Head>
      </Info>
      <Action>
        {data.currentLevel >= PLAYER_MAX_SKILL_LEVEL ? (
          <Limit>
            Max<br />level
          </Limit>
        ) : (
          <>
            <Button>Upgrade</Button>
            <Cost value={data.coins} />
          </>
        )}
      </Action>
    </Container>
  );
};
