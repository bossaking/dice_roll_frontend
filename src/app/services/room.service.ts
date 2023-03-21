import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {JoinRoomDto} from "../DTO/join-room-dto";
import {NewRoomDto} from "../DTO/new-room-dto";

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private http: HttpClient) {
  }

  createRoom(newRoom: NewRoomDto) : Observable<any>{
    return this.http.post('http://localhost:8080/room', newRoom).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        console.log(err.message);
        return of(false);
      })
    );
  }

  joinRoom(joinRoom: JoinRoomDto):Observable<any>{
    return this.http.post('http://localhost:8080/room/join', joinRoom).pipe(
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
}
