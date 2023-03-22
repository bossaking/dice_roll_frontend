import {GameStatusEnum} from "../../enums/game-status-enum";
import {Room} from "../../models/room";

export interface GameStatusResponse {
  gameStatus: GameStatusEnum;
  room: Room;
  redValue: number;
  yellowValue: number;
  specialValue: number;
}
