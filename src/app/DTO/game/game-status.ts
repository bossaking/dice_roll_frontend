import {GameStatusEnum} from "../../enums/game-status-enum";

export interface GameStatus {
  gameStatus: GameStatusEnum;
  userId: string;
}
