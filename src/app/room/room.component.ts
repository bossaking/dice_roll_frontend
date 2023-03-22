import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RoomService} from "../services/room.service";
import {LeaveRoomDto} from "../DTO/leave-room-dto";

import {CompatClient, Stomp} from "@stomp/stompjs";

import SockJS from "sockjs-client";
import {RoomStatus} from "../DTO/game/room-status";
import {ERoomStatus} from "../enums/room-status-enum";
import {RoomStatusResponse} from "../DTO/game/room-status-response";
import {User} from "../models/user";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {

  webSocketEndpoint: string = "http://localhost:8080/ws";

  roomCode: string | null = null;
  isGame: boolean = false;


  // isOwner: boolean = true;
  userId: string | null = null;


  users: User[] = [];


  stompClient: CompatClient | undefined;

  roomStatusWsEndpoint: string = "/room/";
  roomStatusWsEndpointListener: string = "/app/";

  notificationMessage: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private roomService: RoomService) {
    if (router != null) {
      this.roomCode = this.route.snapshot.params['code'].toUpperCase();
      if (this.roomCode === null) {
        this.returnToLogin();
      }
    }

    this.userId = this.roomService.getUserId();
    if (this.userId === null) {
      this.returnToLogin();
    }

    this.roomStatusWsEndpoint = this.roomStatusWsEndpoint + this.roomCode + "/status";
    this.roomStatusWsEndpointListener = this.roomStatusWsEndpointListener + this.roomCode + "/status";
    this._connectToWebSocket();
  }


  leaveRoom() {


    const roomStatus: RoomStatus = {
      roomStatus: ERoomStatus.USER_LEAVE,
      userId: this.userId!,
    };

    this._sendStatus(roomStatus);
    this.stompClient?.disconnect();

    this.returnToLogin();
  }


  returnToLogin() {
    this.router.navigate(['']);
  }

  _connectToWebSocket() {
    const ws = new SockJS(this.webSocketEndpoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient!.connect({}, function (frame: any) {

      const roomStatus: RoomStatus = {
        roomStatus: ERoomStatus.USER_JOIN,
        userId: _this.userId!,
      };

      _this.stompClient!.subscribe(_this.roomStatusWsEndpoint, function (sdkEvent) {
        _this.onRoomStatusMessageReceived(JSON.parse(sdkEvent.body));
      });

      _this._sendStatus(roomStatus);

    }, this.errorCallBack);
  }

  errorCallBack(error: any) {
    console.log("Error -> " + error);
    setTimeout(() => {
      console.log("Reconnecting...");
      this._connectToWebSocket();
    }, 5000);
  }

  _sendStatus(message: RoomStatus) {
    this.stompClient!.send(this.roomStatusWsEndpointListener, {}, JSON.stringify(message));
  }

  onRoomStatusMessageReceived(response: RoomStatusResponse) {
    console.log(response);
    switch (response.roomStatus) {
      case ERoomStatus.USER_JOIN:
        this.notificationMessage = response.username + " joined";
        break;
      case ERoomStatus.USER_LEAVE:
        this.notificationMessage = response.username + " leaved";
        break;
    }

    console.log(this.notificationMessage);
    setTimeout(() => {
      this.notificationMessage = null;
    }, 2500);
    this.users = response.room.users;
  }

  isOwner() : boolean{
    return this.users.findIndex(u => u.id === this.userId && u.owner) !== -1;
  }

}
