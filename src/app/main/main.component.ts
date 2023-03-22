import {Component} from '@angular/core';
import {FormControl} from "@angular/forms";
import {UserService} from "../services/user.service";
import {NewRoomDto} from "../DTO/new-room-dto";
import {RoomService} from "../services/room.service";
import {JoinRoomDto} from "../DTO/join-room-dto";
import {Router} from "@angular/router";
import {NewRoomResponse} from "../DTO/new-room-response";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  inProgress: boolean = false;
  joiningRoom: boolean = false;
  creatingRoom: boolean = false;

  usernameFormControl = new FormControl('');
  roomCodeFormControl = new FormControl('');


  constructor(private userService: UserService, private roomService: RoomService, private router: Router) {
  }

  createRoom() {

    if (!this.checkUsername() || this.inProgress) {
      return;
    }

    this.inProgress = true;
    this.creatingRoom = true;

    const newUser: NewRoomDto = {
      username: this.usernameFormControl.value!
    };

    this.roomService.createRoom(newUser).subscribe((result : any) => {
      if (result === false) {
        this.inProgress = false;
        this.creatingRoom = false;
        return;
      }

      this.inProgress = false;
      this.creatingRoom = false;

      this.router.navigate(['/room/' + result.code]);

    });


  }

  joinRoom() {

    if (!this.checkUsername() || !this.checkRoomCode() || this.inProgress) {
      return;
    }

    this.inProgress = true;
    this.joiningRoom = true;

    const joinRoomDTO: JoinRoomDto = {
      username: this.usernameFormControl.value!,
      roomCode: this.roomCodeFormControl.value!
    };


    this.roomService.joinRoom(joinRoomDTO).subscribe(result => {
      if (result.status === false) {

        switch (result.message) {
          case 'Username is taken':
            this.usernameFormControl.setErrors({'taken': true});
            this.usernameFormControl.markAsTouched();
            break;
          case 'Incorrect room code':
            this.roomCodeFormControl.setErrors({'incorrect_code': true});
            this.roomCodeFormControl.markAsTouched();
            break;
        }

        this.inProgress = false;
        this.joiningRoom = false;
        return;
      }

      this.inProgress = false;
      this.joiningRoom = false;


      this.router.navigate(['/room/' + this.roomCodeFormControl.value!]);
    });

  }


  checkUsername(): boolean {
    if (this.usernameFormControl.value?.length! <= 2) {
      this.usernameFormControl.setErrors({'min_length': true});
      this.usernameFormControl.markAsTouched();
      return false;
    }
    return true;
  }

  checkRoomCode(): boolean {
    if (this.roomCodeFormControl.value?.length! == 0) {
      this.roomCodeFormControl.setErrors({'required': true});
      this.roomCodeFormControl.markAsTouched();
      return false;
    }
    return true;
  }

  getMinLengthErrorMessage(): string {
    return 'Username must contains at least 3 characters';
  }

  getRequiredErrorMessage(): string {
    return 'Field is required';
  }

  getTakenError() {
    return 'Username is taken';
  }

  getCodeError() {
    return 'Incorrect room code';
  }

}
