import {ERoomStatus} from "../../enums/room-status-enum";

export interface RoomStatus {
  roomStatus: ERoomStatus;
  userId: string;
}
