import type { Program } from '@coral-xyz/anchor';

import type { GamePrototype } from './game-prototype';
import { derivePlayerPda } from './helpers';
import type { Player } from './types';

// Для получения состояния игрока передайте соответствующую программу (подключенную к нужной сети: солана или роллап)
export const fetchPlayerState = async (
  program: Program<GamePrototype>,
): Promise<Player> => {
  const playerPda = derivePlayerPda(program);
  const playerAccount = await program.account.player.fetch(playerPda);
  return {
    publicKey: playerPda.toString(),
    moveCounter: playerAccount.moveCounter.toNumber(),
    attackCounter: playerAccount.attackCounter.toNumber(),
  } as Player;
};
