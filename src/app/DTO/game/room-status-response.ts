import {ERoomStatus} from "../../enums/room-status-enum";
import {Room} from "../../models/room";

export interface RoomStatusResponse {
  roomStatus: ERoomStatus;
  userId: string;
  username: string;
  room: Room;
}
