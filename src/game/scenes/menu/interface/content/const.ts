import { MenuPage } from '../../types';

import { AboutGame } from './about-game';
import { Controls } from './controls';
import { Settings } from './settings';
import { StartGame } from './start-game';

export const PAGES: Record<MenuPage, React.FC> = {
  [MenuPage.START_GAME]: StartGame,
  [MenuPage.SETTINGS]: Settings,
  [MenuPage.ABOUT_GAME]: AboutGame,
  [MenuPage.CONTROLS]: Controls,
};
