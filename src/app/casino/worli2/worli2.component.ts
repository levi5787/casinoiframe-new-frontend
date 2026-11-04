import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-worli2',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './worli2.component.html',
  styleUrl: './worli2.component.css'
})
export class Worli2Component {

  gametab=true; bettab=false;
  isSticky = false; sidebarTopOffset = 124; userButtons: any = {}; setButtonTab='casino';
  placebetButton:any=[]; loader=false; placeLoader=false;
  roundId = ""; autotime = 0; clock: any; beforeNum = 0; min:any; max:any;
  c1 = ""; c2 = ""; c3 = ""; singleData: any = {};
data:any;
  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
  results: any = []; tempCard: any = []; tempWin = ""; temprId = ""; tempSid = ""; desc: any = [];
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  safeURL: any;mybets:any=[]; cvideoURL:any;

  constructor(
    private modalService:NgbModal,
    private match_service:MatchService,
    private socket_service:SocketService,
    private _sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private userauth: UserauthService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3040')
    this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'worli2').subscribe((data: any) => {
      //console.log(data)
      //code for flipclock
      this.data = data['data']
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      if(this.roundId!=data['data']['t1'][0]['mid']){
        this.mybets=[];
      }
      this.roundId = (data['data']['t1'][0]['mid']);
      this.min = (data['data']['t1'][0]['min']);
      this.max = (data['data']['t1'][0]['max']);
      this.c1 = "/img/cards/" + data['data']['t1'][0]['C1'] + ".png";
      this.c2 = "/img/cards/" + data['data']['t1'][0]['C2'] + ".png";
      this.c3 = "/img/cards/" + data['data']['t1'][0]['C3'] + ".png";

      this.singleData = data.data.t2[0];
    })
    this.socket_service.casinolast10('Last10', 'worli2').subscribe((winnerdata: any) => {
      this.results = winnerdata['data'];
      //this.results = this.results.reverse();
    });
    setTimeout(() => {
      this.getopenbet();
      setTimeout(() => {
        this.getopenbet()
      }, 2000);
    }, 1500);
    this.socket_service.updateCheck('User',this.userauth.getUsername()).subscribe((data:any)=>{
      if(data.update){
        this.userauth.getUserBalance();
        this.getopenbet();
      }
    })
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  getCvideoURL() {
    this.match_service.getCVideo('worli2').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  openBetForm(content:any,betfor: string, odds: any, type: string, sid: number, oddstype: string, min:number=0, max:number=0) {
    this.showbetform = true
    this.betFor = betfor;
    this.odds = odds;
    this.betType = type;
    this.oddsType = oddstype;
    this.profit = 0
    this.loss = 0
    this.stake = null;
    this.sid = sid;
    this.min = min;
    this.max = max;
    if(window.innerWidth<1100){
      this.modalService.open(content)
    }
  }
  hideBetPlace() {
    this.showbetform = false
  }
  placeStake(val: number) {
    this.stake += val;
    this.calcProfit();
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
  }
  calcProfit() {

  }

  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'worli2', matchname: 'Instant Worli', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
    this.userauth.placeCasinoBet(dt).subscribe({
      next:(res:any)=>{
        this.placeLoader=false;
        this.showbetform=false;
        this.displayToast(res.message,res.status);
        this.getopenbet();this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error:(e)=>{
        this.placeLoader=false;
        this.showbetform=false;
        this.displayToast(e.error.message,"failed");
        this.modalService.dismissAll();
      }
    })
  }

  getopenbet(){
    this.userauth.getCasinoOpenBet("worli2",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
      },error:(e)=>console.log(e)
    })
  }

  displayToast(msg:any,type:any) {
    if(type=="success"){
      this.toastr.success(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton:true,
      });
    }else{
      this.toastr.error(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton:true,
      });
    }
  }

  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }

  openResult(content: any, rid: any) {
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.modalService.open(content, { size: 'xl' })
      this.loader=false;
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempCard = winnerdata['data'][0]['cards'].split(',');
      this.tempSid = winnerdata['data'][0]['sid'];
      this.tempWin = winnerdata['data'][0]['win'];
      this.desc = winnerdata['data'][0]['desc'].split('|');
    })
  }

  updateClock(time: number) {
    if (time < 10) {
      this.cfirstnum = 0;
      this.clastnum = time;
      //flip number
      this.flipsecond = true;
      setTimeout(() => {
        this.flipNumber();
      }, 500);

    } else {
      let stime = time.toString()
      this.cfirstnum = parseInt(stime.charAt(0));
      this.clastnum = parseInt(stime.charAt(1));
      //flip number
      //this.flipfirst=true;
      this.flipsecond = true;
      setTimeout(() => {
        this.flipNumber();
      }, 500);
    }
  }
  flipNumber() {
    this.flipfirst = false;
    this.flipsecond = false;
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  gameTabClicked(){
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked(){
    this.bettab = true;
    this.gametab = false;
  }
  placeBetButton() {
    this.userauth.getButtons().subscribe({
      next: (res: any) => {
        this.placebetButton = res.casinobutton;
        //console.log(this.placebetButton)
      }, error: (e) => console.log(e)
    })
  }
  clickSetButtonTab(name: any) {
    this.setButtonTab = name
  }
  openButtons(content: any) {
    this.userauth.getButtons().subscribe({
      next: (res) => {
        this.userButtons = res;
        this.modalService.open(content, { size: 'md' });
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  updateButtons() {
    this.userauth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        this.modalService.dismissAll();
      }, error: (e) => {
        this.toastr.error(e.error.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        this.modalService.dismissAll();
      }
    })
  }
}
