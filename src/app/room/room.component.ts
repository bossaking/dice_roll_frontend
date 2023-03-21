import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {

  roomCode:String | null = null;
  isGame: boolean = false;

  constructor(private router:Router, private route:ActivatedRoute) {
    if(router != null){
      this.roomCode =this.route.snapshot.params['code'];
    }
  }

}
