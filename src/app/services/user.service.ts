import { Injectable } from '@angular/core';
import {catchError, map, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NewRoomDto} from "../DTO/new-room-dto";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) {

  }


  createUser(newUser: NewRoomDto) : Observable<any>{
    return this.http.post('http://localhost:8080/user', newUser).pipe(
      map((result:any) => {
        return result.id;
      }),
      catchError((err) => {
        console.log(err);
        return of(false);
      })
    );
  }

}
