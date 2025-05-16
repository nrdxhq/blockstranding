import { Game } from './game';

import { checkScreenOrientation } from '~lib/screen';

window.GAME = new Game();

checkScreenOrientation();
