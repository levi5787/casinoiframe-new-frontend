import { Injectable } from '@angular/core';
import { io } from "socket.io-client";
import { observable, Observable, Subscriber } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserauthService } from './userauth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket:any; scoreSocket:any; sportSocket:any; sessionSocket:any;
  //readonly uri:string = "http://139.59.39.186:3010";
  //readonly scoreuri:string = "https://score.sqlr.xyz";
  //readonly sporturi:string = "http://wd.marketsarket.in:3030"

  readonly socket_uri:string = environment.socketURI;
  constructor(private userAuth:UserauthService) {
    /*
    this.socket = io(this.uri,{ // for casino
      transports: ['websocket']
    });
    this.scoreSocket = io(this.scoreuri,{ // for score
      transports: ['websocket']
    });
    */
    this.sportSocket = io(this.socket_uri,{ // for sport data
      transports: ['websocket'],
      query: { token: this.userAuth.getToken() }
    });
   }

  // Real-time single-session: connect to the backend API socket (which joins a room
  // named by the username from the auth token) and log out instantly when the server
  // pushes "force_logout". The device that JUST logged in carries the survivorToken and
  // ignores its own event, so only the previous session is kicked. Re-created on each
  // call (re-login) with the current token.
  listenForceLogout(){
    try {
      if (this.sessionSocket) { try { this.sessionSocket.disconnect(); } catch(e){} this.sessionSocket = null; }
      const token = this.userAuth.getToken();
      if (!token) return;
      this.sessionSocket = io(environment.backendURI, {
        transports: ['websocket'],
        auth: { token }
      });
      this.sessionSocket.on('force_logout', (payload:any) => {
        const myToken = this.userAuth.getToken();
        if (payload && payload.survivorToken && payload.survivorToken === myToken) return;
        this.userAuth.logOut();
      });
    } catch (e) {}
  }

  gamedata(eventName:string,matchid:any){ //for sport data
    this.sportSocket.emit(eventName,matchid)
    return new Observable((Subscriber)=>{
      this.sportSocket.on("Market/"+matchid,(data:any)=>{
        Subscriber.next(data);
        //Subscriber.next(JSON.parse(this.userAuth.DecryptData(data)));
      })
    })
  }
  scoredata(eventName:string,matchid:any){ //for score data
    this.sportSocket.emit(eventName,matchid)
    return new Observable((Subscriber)=>{
      this.sportSocket.on("Score/"+matchid,(data:any)=>{
        Subscriber.next(data);
        //Subscriber.next(JSON.parse(this.userAuth.DecryptData(data)));
      })
    })
  }
  casinodata(eventName:string,matchCode:any){ //for casino data
    //console.log(eventName)
    this.sportSocket.emit(eventName,matchCode)
    return new Observable((Subscriber)=>{
      this.sportSocket.on("Casino/"+matchCode,(data:any)=>{
        Subscriber.next(data);
        //Subscriber.next(JSON.parse(this.userAuth.DecryptData(data)));
      })
    })
  }
  casinolast10(eventName:string,matchCode:any){ //for casino data
    this.sportSocket.emit(eventName,matchCode)
    return new Observable((Subscriber)=>{
      this.sportSocket.on("Last10/"+matchCode,(data:any)=>{
        Subscriber.next(data);
        //Subscriber.next(JSON.parse(this.userAuth.DecryptData(data)));
      })
    })
  }

  updateCheck(eventName:string,username:any){ //for balance and exposure
    this.sportSocket.emit(eventName,username)
    return new Observable((Subscriber)=>{
      this.sportSocket.on("User/"+username,(data:any)=>{
        //Subscriber.next(data);
        Subscriber.next(JSON.parse(this.userAuth.DecryptData(data)));
      })
    })
  }

  leavaAllRooms(){
    this.sportSocket.emit('leaveAllRooms');
  }

  disconnect(){
    this.socket.disconnect();
  }


  dataemit(eventName:string,data:any){ // for casino
    this.socket.emit(eventName,data)
    return new Observable((Subscriber)=>{
      this.socket.on(eventName+'/'+data,(data:any)=>{
        Subscriber.next(data);
      })
    })
  }
  resultemit(eventName:string,data:any){ // for casino result
    this.socket.emit(eventName,data)
    return new Observable((Subscriber)=>{
      this.socket.on(eventName+'/'+data,(data:any)=>{
        Subscriber.next(data);
      })
    })
  }

  scoredataemit(gameid:any){ // for score
    this.scoreSocket.emit('score',gameid)
    return new Observable((Subscriber)=>{
      this.scoreSocket.on('score',(data:any)=>{
        Subscriber.next(data);
      })
    })
  }

  disconnectScore(){
    this.scoreSocket.disconnect();
  }
  disconnectSport(){
    this.sportSocket.disconnect();
  }
}
