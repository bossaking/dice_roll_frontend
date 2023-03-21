import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from '@angular/material/icon';
import { MainComponent } from './main/main.component';
import {Router, RouterModule} from "@angular/router";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import { RoomComponent } from './room/room.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    RoomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    RouterModule.forRoot([
      {path:'', component:MainComponent},
      {path: 'room/:code', component: RoomComponent},
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
