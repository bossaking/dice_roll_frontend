import {User} from "./user";

export interface Room {
  code: string;
  id: string;
  users: User[];
  game:boolean;
  moves:number;
}
