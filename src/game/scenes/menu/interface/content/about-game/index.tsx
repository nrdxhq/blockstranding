import React from 'react';

import { List, Text, Wrapper, Placeholder, Light } from './styles';

export const AboutGame: React.FC = () => (
  <Wrapper>
    <Text>
      You're stepping into an open virtual world where you can explore, survive
      and build your own space.
    </Text>
    <Text>
      This is the world’s first <Light>OMRPG (Onchain Multiplayer RPG),</Light>{' '}
      featuring real-time execution of every action on Solana, powered by
      MagicBlock technology.
    </Text>
    <List>
      <List.Item>
        Venture across an endless map, gather resources and craft.
      </List.Item>
      <List.Item>Defend your base from enemies.</List.Item>
      <List.Item>Face off in PvP and level up your character.</List.Item>
      <List.Item>Earn tokens along the way!</List.Item>
    </List>
    <Placeholder>
      The game is currently in beta. Some features are limited and still in
      progress.
    </Placeholder>
  </Wrapper>
);
