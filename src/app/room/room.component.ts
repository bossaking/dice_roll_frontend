import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RoomService} from "../services/room.service";

import {CompatClient, Stomp} from "@stomp/stompjs";

import SockJS from "sockjs-client";
import {RoomStatus} from "../DTO/game/room-status";
import {ERoomStatus} from "../enums/room-status-enum";
import {RoomStatusResponse} from "../DTO/game/room-status-response";
import {User} from "../models/user";
import {Room} from "../models/room";
import {GameStatus} from "../DTO/game/game-status";
import {GameStatusEnum} from "../enums/game-status-enum";
import {GameStatusResponse} from "../DTO/game/game-status-response";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {

  webSocketEndpoint: string = "http://tani-projekt.pl:8080/ws";

  roomCode: string | null = null;

  userId: string | null = null;

  room: Room | null = null;
  users: User[] = [];


  stompClient: CompatClient | undefined;

  roomStatusWsEndpoint: string = "/room/";
  roomStatusWsEndpointListener: string = "/app/";

  gameStatusWsEndpoint: string = "/room/";
  gameStatusWsEndpointListener: string = "/app/";

  notificationMessage: string | null = null;

  isRolling: boolean = false;
  isResult: boolean = false;

  lastResult: GameStatusResponse | null = null;

  canRoll: boolean = true;

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
    this.gameStatusWsEndpoint = this.gameStatusWsEndpoint + this.roomCode + "/roll";
    this.gameStatusWsEndpointListener = this.gameStatusWsEndpointListener + this.roomCode + "/roll";

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

  _connectToGame() {
    const _this = this;
    _this.stompClient!.subscribe(_this.gameStatusWsEndpoint, function (sdkEvent) {
      _this.onGameStatusMessageReceived(JSON.parse(sdkEvent.body));
    });
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

  _sendGameStatus(message: GameStatus) {
    this.stompClient!.send(this.gameStatusWsEndpointListener, {}, JSON.stringify(message));
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
      case ERoomStatus.GAME_START:
        this._connectToGame();
        break;
    }

    console.log(this.notificationMessage);
    setTimeout(() => {
      this.notificationMessage = null;
    }, 2500);

    this.users = response.room.users;
    this.room = response.room;

    if (response.roomStatus === ERoomStatus.USER_JOIN && response.userId === this.userId) {
      if (this.room?.game) {
        this._connectToGame();
      }
    }
  }


  onGameStatusMessageReceived(response: GameStatusResponse) {
    console.log(response);
    this.isRolling = false;
    this.canRoll = false;
    switch (response.gameStatus) {
      case GameStatusEnum.ROLLING:
        this.isRolling = true;
        break;
      case GameStatusEnum.RESULT:
        this.isResult = true;
        this.lastResult = response;
        break;
      case GameStatusEnum.NEXT_MOVE:
        this.room = response.room;
        this.users = response.room.users;
        this.canRoll = this.userMove();
        break;
    }
  }

  isFirstMove(): boolean {
    return this.room?.moves === 0 && this.lastResult == null && !this.isRolling;
  }

  isOwner(): boolean {
    return this.users.findIndex(u => u.id === this.userId && u.owner) !== -1;
  }

  startGame() {
    if (!this.isOwner()) return;

    const roomStatus: RoomStatus = {
      roomStatus: ERoomStatus.GAME_START,
      userId: this.userId!,
    };

    this._sendStatus(roomStatus);
  }

  isMoving(userId: string) {
    return this.users.findIndex(u => u.id === userId && u.moving) !== -1;
  }

  userMove() {
    return this.users.findIndex(u => u.id === this.userId && u.moving) !== -1;
  }

  roll() {
    if (!this.userMove()) return;

    let gameStatus: GameStatus = {
      gameStatus: GameStatusEnum.ROLLING,
      userId: this.userId!,
    };

    this._sendGameStatus(gameStatus);

    gameStatus = {
      gameStatus: GameStatusEnum.RESULT,
      userId: this.userId!,
    };

    setTimeout(() => {
      this._sendGameStatus(gameStatus);
    }, 1000);

  }

  nextMove() {
    let gameStatus: GameStatus = {
      gameStatus: GameStatusEnum.NEXT_MOVE,
      userId: this.userId!,
    };
    this._sendGameStatus(gameStatus);
  }

}
