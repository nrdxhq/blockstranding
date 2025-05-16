import { useGame } from 'phaser-react-ui';
import React, { useMemo, useState } from 'react';

import type { IGame } from '~game/types';
import { GameState } from '~game/types';
import type { MenuItem } from '~scene/menu/types';
import { MenuPage } from '~scene/menu/types';
import { Confirm } from '~scene/system/interface/confirm';

import { Wrapper, Item, Space } from './styles';

type Props = {
  page?: MenuPage
  onSelect: (page: MenuPage) => void
};

export const Navigation: React.FC<Props> = ({ page, onSelect }) => {
  const game = useGame<IGame>();

  const [confirmation, setConfirmation] = useState<Nullable<{
    message: string
    onConfirm:() => void
      }>>(null);

  const menuItems = useMemo(() => {
    const items: (MenuItem | null)[] = [];

    if (game.state === GameState.IDLE) {
      items.push({
        label: 'Start game',
        page: MenuPage.START_GAME,
      });
    } else {
      items.push({
        label: 'Continue game',
        onClick: () => game.resumeGame(),
      }, {
        label: 'Main menu',
        onClick: () => {
          setConfirmation({
            message: 'Do you confirm to stop the game?',
            onConfirm: () => {
              game.stopGame();
            },
          });
        },
      });
    }

    items.push(null, {
      label: 'Settings',
      page: MenuPage.SETTINGS,
    }, {
      label: 'About game',
      page: MenuPage.ABOUT_GAME,
    });

    if (game.isDesktop()) {
      items.push({
        label: 'Controls',
        page: MenuPage.CONTROLS,
      });
    }

    return items;
  }, []);

  const onConfirmationClose = () => {
    setConfirmation(null);
  };

  const onClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.page) {
      onSelect(item.page);
    }
  };

  return (
    <Wrapper>
      {confirmation && (
        <Confirm {...confirmation} onClose={onConfirmationClose} />
      )}
      {menuItems.map((item, index) => (item ? (
        <Item
          key={item.label}
          onClick={() => onClick(item)}
          $active={item.page === page}
          $disabled={item.disabled}
        >
          {item.label}
        </Item>
      ) : (
        <Space key={index} />
      )))}
    </Wrapper>
  );
};
