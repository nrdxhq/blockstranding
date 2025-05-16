import React, { useMemo } from 'react';

import type { GameStat } from '~game/types';

import { Wrapper, Item, Value, Label, Record } from './styles';

type Props = {
  stat: GameStat
  record: Nullable<GameStat>
};

export const Result: React.FC<Props> = ({ stat, record }) => {
  const statItems: {
    key: keyof GameStat
    label: string
    value: number | string
  }[] = useMemo(() => [
    { key: 'coins', label: 'Total coins', value: stat.coins },
    { key: 'kills', label: 'Enemies killed', value: stat.kills },
    { key: 'lived', label: 'Minutes lived', value: Math.floor(stat.lived) },
  ], []);

  return (
    <Wrapper>
      {statItems.map((item) => (
        <Item key={item.key}>
          <Value>{item.value}</Value>
          <Label>{item.label}</Label>
          {(record?.[item.key] ?? 0) < stat[item.key] && (
            <Record>Record</Record>
          )}
        </Item>
      ))}
    </Wrapper>
  );
};
