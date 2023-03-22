import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {JoinRoomDto} from "../DTO/join-room-dto";
import {NewRoomDto} from "../DTO/new-room-dto";
import {LeaveRoomDto} from "../DTO/leave-room-dto";
import {JoinRoomResponse} from "../DTO/join-room-response";

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private http: HttpClient) {
  }

  createRoom(newRoom: NewRoomDto): Observable<any> {
    return this.http.post('http://localhost:8080/room', newRoom).pipe(
      map((result:any) => {
        this.saveUserId(result.userId);
        return result;
      }),
      catchError(err => {
        console.log(err.message);
        return of(false);
      })
    );
  }

  joinRoom(joinRoom: JoinRoomDto): Observable<any> {
    return this.http.post('http://localhost:8080/room/join', joinRoom).pipe(
      map((result:any) => {
        this.saveUserId(result.userId);
        return of(true);
      }),
      catchError(err => {
        console.log(err);
        return of({
          status: false,
          message: err.error
        });
      })
    );
  }

  leaveRoom(leaveRoom: LeaveRoomDto): Observable<any> {
    this.removeUserId();
    return this.http.post('http://localhost:8080/room/leave', leaveRoom).pipe(
      map(() => {
        return of(true);
      }),
      catchError(err => {
        return of({
          status: false,
          message: err.error
        });
      })
    );
  }


  saveUserId(userId: string) {
    localStorage.setItem("id", userId);
  }

  getUserId(): string | null {
    return localStorage.getItem("id");
  }

  removeUserId(){
    localStorage.removeItem("id");
  }
}
